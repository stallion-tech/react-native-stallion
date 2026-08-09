#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <objbase.h>
#include <winrt/base.h>
#include <winrt/Windows.Data.Json.h>
#include <winrt/Windows.Foundation.Collections.h>

#include "StallionArchive.h"
#include "StallionCore.h"
#include "StallionSignature.h"
#include "StallionNetwork.h"
#include "StallionUpdateManager.h"
#include "StallionWindows.h"
#include "StallionModule.h"
#include <zip.h>

#include <array>
#include <chrono>
#include <condition_variable>
#include <filesystem>
#include <fstream>
#include <functional>
#include <iostream>
#include <iterator>
#include <mutex>
#include <stdexcept>
#include <string>
#include <vector>

namespace fs = std::filesystem;
using ReactNativeStallionWindows::BundleSelection;
using ReactNativeStallionWindows::ArchiveResult;
using ReactNativeStallionWindows::HttpResult;
using ReactNativeStallionWindows::StallionArchive;
using ReactNativeStallionWindows::StallionConfig;
using ReactNativeStallionWindows::StallionCore;
using ReactNativeStallionWindows::StallionSignature;
using ReactNativeStallionWindows::DownloadFile;
using ReactNativeStallionWindows::StallionNetwork;
using ReactNativeStallionWindows::StallionUpdateManager;
using ReactNativeStallionWindows::StallionUpdateDependencies;
using ReactNativeStallionWindows::StallionWindows;
using winrt::ReactNativeStallionWindows::implementation::Stallion;

void Signature_CoverageEntryPoints();

namespace
{
  struct TempRoot
  {
    fs::path path;
    TempRoot()
    {
      GUID id{}; CoCreateGuid(&id); wchar_t text[40]{}; StringFromGUID2(id, text, 40);
      path = fs::temp_directory_path() / (L"stallion-tests-" + std::wstring(text));
      fs::create_directories(path);
    }
    ~TempRoot() { std::error_code ignored; fs::remove_all(path, ignored); }
  };

  void Require(bool condition, char const *message) { if (!condition) throw std::runtime_error(message); }

  template <typename T>
  T ActivateFromModule(wchar_t const *moduleName)
  {
    std::array<wchar_t, 32768> executablePath{};
    auto pathLength = GetModuleFileNameW(nullptr, executablePath.data(), static_cast<DWORD>(executablePath.size()));
    Require(pathLength > 0 && pathLength < executablePath.size(), "could not resolve test executable path");
    auto modulePath = fs::path(executablePath.data()).parent_path() / moduleName;
    auto module = LoadLibraryW(modulePath.c_str());
    if (!module) throw std::runtime_error("could not load WinRT component module (error " + std::to_string(GetLastError()) + ")");
    auto getFactory = reinterpret_cast<HRESULT(WINAPI *)(void *, void **)>(GetProcAddress(module, "DllGetActivationFactory"));
    Require(getFactory != nullptr, "WinRT component has no activation factory export");

    void *factoryAbi{};
    auto className = winrt::hstring(winrt::name_of<T>());
    winrt::check_hresult(getFactory(winrt::get_abi(className), &factoryAbi));
    winrt::Windows::Foundation::IActivationFactory factory{factoryAbi, winrt::take_ownership_from_abi};
    return factory.ActivateInstance<T>();
  }

  struct UpdateCallbackScope
  {
    ~UpdateCallbackScope() { StallionUpdateManager::Instance().SetEventCallback({}); }
  };

  struct WindowsLifecycleScope
  {
    ~WindowsLifecycleScope()
    {
      StallionWindows::SetActive(false);
      StallionWindows::Shutdown();
    }
  };

  struct LoopbackServer
  {
    SOCKET listener{INVALID_SOCKET};
    unsigned short port{};
    std::string response;
    std::string request;
    std::thread worker;

    explicit LoopbackServer(std::string body, unsigned status = 200, std::string extraHeaders = {})
    {
      WSADATA data{};
      Require(WSAStartup(MAKEWORD(2, 2), &data) == 0, "WSAStartup failed");
      listener = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
      Require(listener != INVALID_SOCKET, "could not create test HTTP socket");
      sockaddr_in address{};
      address.sin_family = AF_INET;
      address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
      Require(bind(listener, reinterpret_cast<sockaddr *>(&address), sizeof(address)) == 0, "could not bind test HTTP socket");
      int length = sizeof(address);
      Require(getsockname(listener, reinterpret_cast<sockaddr *>(&address), &length) == 0, "could not read test HTTP port");
      port = ntohs(address.sin_port);
      Require(listen(listener, 1) == 0, "could not listen on test HTTP socket");
      response = "HTTP/1.1 " + std::to_string(status) + (status == 200 ? " OK\r\n" : status == 206 ? " Partial Content\r\n" : " Error\r\n") +
        "Content-Length: " + std::to_string(body.size()) + "\r\nConnection: close\r\n" + extraHeaders + "\r\n" + body;
      worker = std::thread([this] {
        auto client = accept(listener, nullptr, nullptr);
        if (client == INVALID_SOCKET) return;
        std::array<char, 4096> buffer{};
        size_t expected = std::string::npos;
        for (;;) {
          auto count = recv(client, buffer.data(), static_cast<int>(buffer.size()), 0);
          if (count <= 0) break;
          request.append(buffer.data(), static_cast<size_t>(count));
          auto headersEnd = request.find("\r\n\r\n");
          if (headersEnd != std::string::npos && expected == std::string::npos) {
            expected = headersEnd + 4;
            auto lower = request.substr(0, headersEnd);
            std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char value) { return static_cast<char>(std::tolower(value)); });
            auto marker = lower.find("content-length:");
            if (marker != std::string::npos) expected += std::stoul(lower.substr(marker + 15));
          }
          if (expected != std::string::npos && request.size() >= expected) break;
        }
        send(client, response.data(), static_cast<int>(response.size()), 0);
        shutdown(client, SD_BOTH);
        closesocket(client);
      });
    }
    ~LoopbackServer()
    {
      if (worker.joinable()) worker.join();
      if (listener != INVALID_SOCKET) closesocket(listener);
      WSACleanup();
    }
    std::string Url(std::string const &path) const { return "http://127.0.0.1:" + std::to_string(port) + path; }
    void Finish() { if (worker.joinable()) worker.join(); }
  };

  struct MemoryDownloadFile final : DownloadFile
  {
    std::string bytes;
    bool openSucceeds{true};
    size_t writeLimit{SIZE_MAX};
    bool openedAppend{};
    uint64_t ExistingSize() noexcept override { return bytes.size(); }
    bool Open(bool append) noexcept override { openedAppend = append; if (!append) bytes.clear(); return openSucceeds; }
    bool Write(char const *data, size_t size) noexcept override
    {
      if (bytes.size() + size > writeLimit) return false;
      bytes.append(data, size);
      return true;
    }
  };
  void Write(fs::path const &path, std::string const &value)
  {
    fs::create_directories(path.parent_path()); std::ofstream output(path, std::ios::binary); output << value;
  }
  std::string Read(fs::path const &path)
  {
    std::ifstream input(path, std::ios::binary);
    return {std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>()};
  }
  StallionConfig Config(std::string version = "1.0.0.0")
  {
    return {true, "project", "token", "", "", "http://127.0.0.1:43119", std::move(version), "test", "windows"};
  }
  BundleSelection Start(StallionCore &core, fs::path const &root)
  {
    return core.SelectBundle(root / L"default", L"index.windows");
  }
  void PendingBundle(fs::path const &root, std::string const &channel, std::string const &contents)
  {
    Write(root / (channel == "STAGE" ? L"StallionStage" : L"StallionProd") / L"temp" / L"build" / L"index.windows.bundle", contents);
  }

  void State_DefaultAndVersionInvalidation()
  {
    TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path);
    Require(!Start(core, temp.path).isOta, "first launch must use embedded bundle");
    PendingBundle(temp.path, "PROD", "B"); core.MarkDownloaded("PROD", "hash-b");
    Require(Start(core, temp.path).releaseHash == "hash-b", "pending production bundle must mount");
    core.MarkLaunchSuccessful();
    core.Configure(Config("2.0.0.0"), temp.path);
    Require(!Start(core, temp.path).isOta, "native app version change must invalidate OTA slots");
    Require(!fs::exists(temp.path / L"StallionProd"), "invalidated production files must be removed");
  }

  void State_DefaultStorageRootIsNamespaced()
  {
    auto root = StallionCore::DefaultStorageRoot();
    Require(root.is_absolute(), "default storage root must be absolute");
    Require(root.filename() == L"ReactNativeStallion", "default storage root must be library-namespaced");
  }

  void State_CrashRollsBackAndDoesNotRedownloadHash()
  {
    TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
    PendingBundle(temp.path, "PROD", "B"); core.MarkDownloaded("PROD", "hash-b");
    Require(Start(core, temp.path).isOta, "bundle B must mount");
    auto fallback = Start(core, temp.path);
    Require(!fallback.isOta, "uncleared launch marker must roll back to embedded bundle");
    Require(core.MetaJson().find("hash-b") == std::string::npos, "rolled-back hash must leave active slots");
    Require(core.PopEvents().find("AUTO_ROLLED_BACK_PROD") != std::string::npos, "auto rollback must be persisted");
  }

  void State_StableFallbackSurvivesBadReplacement()
  {
    TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
    PendingBundle(temp.path, "PROD", "B"); core.MarkDownloaded("PROD", "hash-b"); Start(core, temp.path); core.MarkLaunchSuccessful();
    PendingBundle(temp.path, "PROD", "C"); core.MarkDownloaded("PROD", "hash-c");
    Require(Start(core, temp.path).releaseHash == "hash-c", "replacement must become new slot");
    Require(Start(core, temp.path).releaseHash == "hash-b", "failed replacement must fall back to stable slot");
  }

  void State_StageFailureIsIsolated()
  {
    TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
    core.SetSwitchState("STAGE"); PendingBundle(temp.path, "STAGE", "S"); core.MarkDownloaded("STAGE", "hash-s");
    Require(Start(core, temp.path).releaseHash == "hash-s", "stage bundle must mount in stage mode");
    core.HandleInstanceLoadFailure("stage failed");
    Require(!Start(core, temp.path).isOta, "stage load failure must return to embedded bundle");
    Require(core.PopEvents().find("DOWNLOAD_ERROR_STAGE") != std::string::npos, "stage failure must be reported");
  }

  void State_CorruptSelectedBundlesRollback()
  {
    {
      TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
      core.SetSwitchState("STAGE"); PendingBundle(temp.path, "STAGE", "S"); core.MarkDownloaded("STAGE", "hash-s");
      Require(Start(core, temp.path).releaseHash == "hash-s", "stage bundle must mount before corruption");
      core.MarkLaunchSuccessful();
      fs::remove(temp.path / L"StallionStage" / L"StallionNew" / L"build" / L"index.windows.bundle");
      Require(!Start(core, temp.path).isOta, "corrupt stage bundle must fall back to embedded bundle");
      auto meta = core.MetaJson();
      Require(meta.find("hash-s") == std::string::npos && meta.find("DEFAULT_SLOT") != std::string::npos,
              "corrupt stage bundle was not removed from the active slot");
      auto events = core.PopEvents();
      Require(events.find("DOWNLOAD_ERROR_STAGE") != std::string::npos &&
              events.find("Selected stage bundle is corrupt") != std::string::npos,
              "corrupt stage bundle error was not reported");
    }
    {
      TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
      PendingBundle(temp.path, "PROD", "B"); core.MarkDownloaded("PROD", "hash-b");
      Require(Start(core, temp.path).releaseHash == "hash-b", "stable candidate must mount");
      core.MarkLaunchSuccessful();
      PendingBundle(temp.path, "PROD", "C"); core.MarkDownloaded("PROD", "hash-c");
      Require(Start(core, temp.path).releaseHash == "hash-c", "replacement must mount before corruption");
      core.MarkLaunchSuccessful();
      fs::remove(temp.path / L"StallionProd" / L"StallionNew" / L"build" / L"index.windows.bundle");
      Require(!Start(core, temp.path).isOta, "corrupt production selection must not mount broken content");
      Require(Start(core, temp.path).releaseHash == "hash-b", "corrupt production bundle must roll back to stable release");
      auto events = core.PopEvents();
      Require(events.find("ROLLED_BACK_PROD") != std::string::npos &&
              events.find("Selected production bundle is corrupt") != std::string::npos,
              "corrupt production rollback was not reported");
    }
  }

  void State_ExplicitStageRollbackAndProductionStabilization()
  {
    {
      TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
      core.SetSwitchState("STAGE"); PendingBundle(temp.path, "STAGE", "S"); core.MarkDownloaded("STAGE", "hash-s");
      Require(Start(core, temp.path).releaseHash == "hash-s", "stage rollback candidate must mount");
      core.MarkLaunchSuccessful();
      core.RollbackStage("manual stage rollback");
      Require(!Start(core, temp.path).isOta && core.ActiveReleaseHash().empty(),
              "explicit stage rollback must restore the embedded bundle");
      auto events = core.PopEvents();
      Require(events.find("DOWNLOAD_ERROR_STAGE") != std::string::npos &&
              events.find("manual stage rollback") != std::string::npos,
              "explicit stage rollback was not reported");
    }
    {
      TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
      PendingBundle(temp.path, "PROD", "B"); core.MarkDownloaded("PROD", "hash-b");
      Require(Start(core, temp.path).releaseHash == "hash-b", "production stabilization candidate must mount");
      core.MarkLaunchSuccessful();
      core.StabilizeProduction();
      Require(core.MetaJson().find("hash-b") != std::string::npos &&
              fs::is_regular_file(temp.path / L"StallionProd" / L"StallionStable" / L"build" / L"index.windows.bundle"),
              "production stabilization did not persist the stable release");
      Require(core.PopEvents().find("STABILIZED_PROD") != std::string::npos,
              "production stabilization was not reported");
      core.RollbackProduction(false, "manual production rollback");
      Require(Start(core, temp.path).releaseHash == "hash-b",
              "explicit production rollback did not select the stabilized release");
      core.MarkLaunchSuccessful();
      fs::remove(temp.path / L"StallionProd" / L"StallionStable" / L"build" / L"index.windows.bundle");
      Require(!Start(core, temp.path).isOta, "corrupt stable release must fall back to the embedded bundle");
      Require(core.MetaJson().find("hash-b") == std::string::npos,
              "corrupt stable release hash was not cleared");
      auto events = core.PopEvents();
      Require(events.find("Selected production bundle is corrupt") != std::string::npos,
              "corrupt stable release rollback was not reported");
      core.RollbackProduction(false, "rollback while already embedded");
      Require(core.PopEvents() == events, "rollback from the default slot must be a no-op");
    }
  }

  void Events_BatchAndAcknowledge()
  {
    TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path); Start(core, temp.path);
    for (int i = 0; i < 12; ++i) core.AddEvent("SYNC_ERROR_PROD", {}, std::to_string(i));
    auto batch = core.PopEvents();
    winrt::Windows::Data::Json::JsonArray parsed; Require(winrt::Windows::Data::Json::JsonArray::TryParse(winrt::to_hstring(batch), parsed), "event batch JSON invalid");
    Require(parsed.Size() == 9, "event batch must be capped at nine");
    std::vector<std::string> ids;
    for (auto const &entry : parsed) ids.push_back(winrt::to_string(entry.GetObject().GetNamedString(L"eventId")));
    core.AcknowledgeEvents(ids);
    winrt::Windows::Data::Json::JsonArray remaining; winrt::Windows::Data::Json::JsonArray::TryParse(winrt::to_hstring(core.PopEvents()), remaining);
    Require(remaining.Size() == 3, "acknowledged events must be durably removed");
  }

  void Network_MetadataContractAndPlatformSelection()
  {
    auto config = Config("9.8.7.6");
    config.projectId = "project with spaces";
    config.platformIdentity = "windows";
    auto payload = StallionUpdateManager::BuildMetadataPayload(config, "active-hash", "device-uid");
    winrt::Windows::Data::Json::JsonObject json;
    Require(winrt::Windows::Data::Json::JsonObject::TryParse(winrt::to_hstring(payload), json), "metadata payload is invalid JSON");
    Require(json.GetNamedString(L"platform") == L"windows", "metadata platform must be windows");
    Require(json.GetNamedString(L"appVersion") == L"9.8.7.6", "metadata app version missing");
    Require(json.GetNamedString(L"projectId") == L"project with spaces", "metadata project ID missing");
    Require(json.GetNamedString(L"appliedBundleHash") == L"active-hash", "metadata active hash missing");
    auto device = json.GetNamedObject(L"deviceMeta");
    Require(device.GetNamedString(L"uid") == L"device-uid", "metadata UID missing");
    Require(device.GetNamedString(L"osName") == L"Windows", "metadata OS identity missing");

    LoopbackServer server("{\"success\":true}");
    auto result = StallionNetwork::PostJson(server.Url("/api/v1/promoted/get-update-meta?projectId=p"), payload,
                                             "app-token", "sdk-token", "device-uid");
    server.Finish();
    Require(result.ok && result.status == 200 && result.body == "{\"success\":true}", "metadata response was not returned");
    auto request = server.request;
    auto lower = request;
    std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char value) { return static_cast<char>(std::tolower(value)); });
    Require(request.starts_with("POST /api/v1/promoted/get-update-meta?projectId=p HTTP/1.1\r\n"), "metadata method or path mismatch");
    Require(lower.find("content-type: application/json") != std::string::npos, "metadata content type missing");
    Require(lower.find("x-app-token: app-token") != std::string::npos, "app token header missing");
    Require(lower.find("x-sdk-pin-access-token: sdk-token") != std::string::npos, "SDK token header missing");
    Require(lower.find("uid: device-uid") != std::string::npos, "UID header missing");
    Require(request.ends_with(payload), "metadata request body mismatch");
  }

  void Network_DownloadResumeStorageAndErrors()
  {
    TempRoot temp;
    auto diskPath = temp.path / L"nested" / L"bundle.zip";
    double diskProgress = 0;
    LoopbackServer diskServer("disk-body");
    auto diskResult = StallionNetwork::Download(diskServer.Url("/disk"), diskPath, "app", "sdk", "uid",
                                                [&](double value) { diskProgress = value; });
    diskServer.Finish();
    Require(diskResult.ok && Read(diskPath) == "disk-body", "fresh disk download was not written");
    Require(diskProgress == 1.0, "fresh disk download progress did not reach one");

    Write(diskPath, "abc");
    LoopbackServer diskResumeServer("def", 206, "Content-Range: bytes 3-5/6\r\n");
    diskResult = StallionNetwork::Download(diskResumeServer.Url("/disk-resume"), diskPath, "", "", "", {});
    diskResumeServer.Finish();
    Require(diskResult.ok && Read(diskPath) == "abcdef", "resumed disk download was not appended");
    auto diskResumeRequest = diskResumeServer.request;
    std::transform(diskResumeRequest.begin(), diskResumeRequest.end(), diskResumeRequest.begin(),
                   [](unsigned char value) { return static_cast<char>(std::tolower(value)); });
    Require(diskResumeRequest.find("range: bytes=3-") != std::string::npos, "disk resume range header missing");

    LoopbackServer diskRestartServer("replacement");
    diskResult = StallionNetwork::Download(diskRestartServer.Url("/disk-restart"), diskPath, "", "", "", {});
    diskRestartServer.Finish();
    Require(diskResult.ok && Read(diskPath) == "replacement", "full disk response did not replace partial cache");

    auto blockedParent = temp.path / L"blocked";
    Write(blockedParent, "not a directory");
    LoopbackServer blockedServer("body");
    auto blockedResult = StallionNetwork::Download(blockedServer.Url("/blocked"), blockedParent / L"bundle.zip",
                                                   "", "", "", {});
    Require(!blockedResult.ok && blockedResult.error == "Unable to open download cache",
            "disk open failure was not reported");

    MemoryDownloadFile resumed;
    resumed.bytes = "abc";
    double progress = 0;
    LoopbackServer partial("def", 206, "Content-Range: bytes 3-5/6\r\n");
    auto result = StallionNetwork::DownloadToFile(partial.Url("/bundle.zip?projectId=p"), resumed,
                                                   "app", "sdk", "uid", [&](double value) { progress = value; });
    partial.Finish();
    Require(result.ok && result.status == 206, "resumed download failed");
    Require(resumed.openedAppend && resumed.bytes == "abcdef", "resumed bytes were not appended");
    Require(progress == 1.0, "download progress did not reach one");
    auto lower = partial.request;
    std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char value) { return static_cast<char>(std::tolower(value)); });
    Require(partial.request.starts_with("GET /bundle.zip?projectId=p HTTP/1.1\r\n"), "download method or URL mismatch");
    Require(lower.find("range: bytes=3-") != std::string::npos, "resume range header missing");
    Require(lower.find("x-app-token: app") != std::string::npos && lower.find("x-sdk-pin-access-token: sdk") != std::string::npos,
            "download authentication headers missing");

    MemoryDownloadFile readOnly;
    readOnly.openSucceeds = false;
    LoopbackServer readOnlyServer("zip");
    auto openFailure = StallionNetwork::DownloadToFile(readOnlyServer.Url("/readonly"), readOnly, "", "", "", {});
    Require(!openFailure.ok && openFailure.error == "Unable to open download cache", "read-only/open failure was not reported");

    MemoryDownloadFile full;
    full.writeLimit = 0;
    LoopbackServer fullServer("zip");
    auto writeFailure = StallionNetwork::DownloadToFile(fullServer.Url("/full"), full, "", "", "", {});
    Require(!writeFailure.ok && writeFailure.error == "Unable to write update download", "out-of-space/write failure was not reported");

    LoopbackServer rejected("no", 503);
    MemoryDownloadFile ignored;
    auto httpFailure = StallionNetwork::DownloadToFile(rejected.Url("/failure"), ignored, "", "", "", {});
    Require(!httpFailure.ok && httpFailure.status == 503, "download HTTP error was not reported");
    Require(!StallionNetwork::Download("http://example.com/bundle", L"ignored", "", "", "", {}).ok,
            "non-loopback HTTP download was accepted");
  }

  bool HasEvent(std::vector<std::string> const &events, std::string const &type)
  {
    return std::any_of(events.begin(), events.end(), [&](auto const &event) { return event.find("\"type\":\"" + type + "\"") != std::string::npos; });
  }

  StallionUpdateDependencies UpdateDependencies()
  {
    return {
      [](auto const &, auto const &, auto const &, auto const &, auto const &) { return HttpResult{true, 200, "{\"success\":true,\"data\":{}}", {}}; },
      [](auto const &, auto const &, auto const &, auto const &, auto const &, auto const &) { return HttpResult{true, 200, {}, {}}; },
      [](auto const &, auto const &, auto const &) { return ArchiveResult{true, {}}; },
      [](auto const &, auto const &, auto &) { return true; }};
  }

  void UpdateManager_MetadataOutcomes()
  {
    {
      TempRoot temp;
      auto config = Config(); config.enabled = false;
      StallionCore::Instance().Configure(config, temp.path);
      auto dependencies = UpdateDependencies();
      bool requested = false;
      dependencies.postJson = [&](auto const &, auto const &, auto const &, auto const &, auto const &) { requested = true; return HttpResult{}; };
      StallionUpdateManager manager(std::move(dependencies));
      std::vector<std::string> events; manager.SetEventCallback([&](auto const &event) { events.push_back(event); });
      manager.SyncNow();
      Require(!requested, "disabled Stallion requested metadata");
      Require(HasEvent(events, "SYNC_STATUS_STARTED") && HasEvent(events, "SYNC_STATUS_ERROR"), "disabled sync events missing");
    }
    for (auto const &[body, expected] : std::vector<std::pair<std::string, std::string>>{
           {"not-json", "SYNC_ERROR_PROD"}, {"{\"success\":false}", "SYNC_STATUS_ERROR"},
           {"{\"success\":true,\"data\":{}}", "SYNC_STATUS_NO_UPDATE"},
           {"{\"success\":true,\"data\":{\"newBundleData\":{\"downloadUrl\":\"\",\"checksum\":\"\"}}}", "SYNC_STATUS_ERROR"}}) {
      TempRoot temp; StallionCore::Instance().Configure(Config(), temp.path);
      auto dependencies = UpdateDependencies();
      dependencies.postJson = [body](auto const &, auto const &, auto const &, auto const &, auto const &) { return HttpResult{true, 200, body, {}}; };
      StallionUpdateManager manager(std::move(dependencies));
      std::vector<std::string> events; manager.SetEventCallback([&](auto const &event) { events.push_back(event); });
      manager.SyncNow();
      Require(HasEvent(events, expected), "metadata outcome event missing");
    }
    {
      TempRoot temp; StallionCore::Instance().Configure(Config(), temp.path);
      auto dependencies = UpdateDependencies();
      dependencies.postJson = [](auto const &, auto const &, auto const &, auto const &, auto const &) {
        return HttpResult{false, 503, std::string(600, 'x'), "metadata unavailable"};
      };
      StallionUpdateManager manager(std::move(dependencies));
      std::vector<std::string> events; manager.SetEventCallback([&](auto const &event) { events.push_back(event); });
      manager.SyncNow();
      Require(HasEvent(events, "SYNC_ERROR_PROD"), "metadata transport failure event missing");
      Require(events.back().find("HTTP 503") != std::string::npos && events.back().find("...") != std::string::npos,
              "metadata transport detail was not bounded and reported");
    }
  }

  void UpdateManager_DownloadOrchestration()
  {
    TempRoot temp;
    auto config = Config(); config.publicSigningKey = "public-key"; config.archivePassword = "archive-password";
    auto &core = StallionCore::Instance(); core.Configure(config, temp.path); core.SetSdkToken("sdk-token");
    auto dependencies = UpdateDependencies();
    bool downloaded = false, extracted = false, verified = false;
    dependencies.postJson = [](auto const &url, auto const &payload, auto const &appToken, auto const &sdkToken, auto const &uid) {
      Require(url.ends_with("/api/v1/promoted/get-update-meta"), "metadata endpoint mismatch");
      Require(payload.find("\"platform\":\"windows\"") != std::string::npos, "metadata platform missing");
      Require(appToken == "token" && sdkToken == "sdk-token" && !uid.empty(), "metadata credentials mismatch");
      return HttpResult{true, 200, "{\"success\":true,\"data\":{\"newBundleData\":{\"downloadUrl\":\"https://download.test/release.zip?x=1\",\"checksum\":\"release-hash\"}}}", {}};
    };
    dependencies.download = [&](auto const &url, auto const &archive, auto const &appToken, auto const &sdkToken, auto const &uid, auto const &progress) {
      downloaded = true;
      Require(url == "https://download.test/release.zip?x=1&projectId=project", "download project ID mismatch");
      Require(archive == temp.path / L"StallionProd" / L"download.zip", "download cache path mismatch");
      Require(appToken == "token" && sdkToken == "sdk-token" && !uid.empty(), "download credentials mismatch");
      progress(0.5);
      Write(archive, "zip");
      return HttpResult{true, 200, {}, {}};
    };
    dependencies.extract = [&](auto const &archive, auto const &destination, auto const &password) {
      extracted = true;
      Require(fs::exists(archive) && password == "archive-password", "archive extraction inputs mismatch");
      Write(destination / L"build" / L"index.windows.bundle", "bundle");
      return ArchiveResult{true, {}};
    };
    dependencies.verifySignature = [&](auto const &build, auto const &key, auto &) {
      verified = true; Require(build == temp.path / L"StallionProd" / L"temp" / L"build" && key == "public-key", "signature inputs mismatch"); return true;
    };
    StallionUpdateManager manager(std::move(dependencies));
    std::vector<std::string> events; manager.SetEventCallback([&](auto const &event) { events.push_back(event); });
    manager.SyncNow();
    Require(downloaded && extracted && verified, "update pipeline did not complete");
    Require(core.MetaJson().find("release-hash") != std::string::npos, "downloaded hash was not committed");
    for (auto const &type : {"DOWNLOAD_STARTED_PROD", "DOWNLOAD_PROGRESS_PROD", "DOWNLOAD_COMPLETE_PROD", "SYNC_STATUS_COMPLETE"})
      Require(HasEvent(events, type), "successful update event missing");
  }

  void UpdateManager_DownloadFailuresAndRollback()
  {
    for (int failure = 0; failure < 3; ++failure) {
      TempRoot temp; auto config = Config(); if (failure == 2) config.publicSigningKey = "key";
      StallionCore::Instance().Configure(config, temp.path);
      auto dependencies = UpdateDependencies();
      dependencies.postJson = [](auto const &, auto const &, auto const &, auto const &, auto const &) {
        return HttpResult{true, 200, "{\"success\":true,\"data\":{\"newBundleData\":{\"downloadUrl\":\"https://download.test/a.zip\",\"checksum\":\"bad-hash\"}}}", {}};
      };
      dependencies.download = [failure](auto const &, auto const &archive, auto const &, auto const &, auto const &, auto const &) {
        if (failure == 0) return HttpResult{false, 0, {}, "download failed"}; Write(archive, "zip"); return HttpResult{true, 200, {}, {}};
      };
      dependencies.extract = [failure](auto const &, auto const &destination, auto const &) {
        if (failure == 1) return ArchiveResult{false, "extract failed"}; Write(destination / L"build" / L"index.windows.bundle", "bundle"); return ArchiveResult{true, {}};
      };
      dependencies.verifySignature = [](auto const &, auto const &, auto &error) { error = "signature failed"; return false; };
      StallionUpdateManager manager(std::move(dependencies));
      std::vector<std::string> events; manager.SetEventCallback([&](auto const &event) { events.push_back(event); });
      manager.SyncNow();
      Require(HasEvent(events, failure == 2 ? "SIGNATURE_VERIFICATION_FAILED" : "DOWNLOAD_ERROR_PROD"), "download failure event missing");
      Require(StallionCore::Instance().MetaJson().find("bad-hash") == std::string::npos, "failed release was committed");
    }
    {
      TempRoot temp; auto &core = StallionCore::Instance(); core.Configure(Config(), temp.path);
      Start(core, temp.path);
      PendingBundle(temp.path, "PROD", "stable"); core.MarkDownloaded("PROD", "stable-hash");
      Start(core, temp.path); core.MarkLaunchSuccessful();
      auto dependencies = UpdateDependencies();
      dependencies.postJson = [](auto const &, auto const &, auto const &, auto const &, auto const &) {
        return HttpResult{true, 200, "{\"success\":true,\"data\":{\"appliedBundleData\":{\"isRolledBack\":true,\"targetAppVersion\":\"1.0.0.0\"}}}", {}};
      };
      StallionUpdateManager manager(std::move(dependencies)); manager.SyncNow();
      Require(core.MetaJson().find("stable-hash") == std::string::npos, "server rollback did not clear active release");
      Require(core.PopEvents().find("ROLLED_BACK_PROD") != std::string::npos, "server rollback event missing");
    }
  }

  void Windows_ConfigUriAndUnconfiguredLifecycle()
  {
    auto config = StallionWindows::BuildConfig();
    if (config.platformIdentity != "windows") throw std::runtime_error("compiled Windows platform identity mismatch: " + config.platformIdentity);
    Require(config.appVersion == "7.6.5.4", "compiled Windows app version override mismatch");
    Require(config.sdkVersion == "2.4.1-windows.1", "compiled Windows SDK version mismatch");
    Require(StallionWindows::FormatPackageVersion(1, 2, 3, 4) == "1.2.3.4", "package version formatting mismatch");
    Require(StallionWindows::BundleRootUri(L"C:\\app\\Bundle") == L"file:///C:/app/Bundle/", "bundle root URI mismatch");
    StallionWindows::Restart();
    StallionWindows::Shutdown();
  }

  void Windows_RegisterConfigureActiveAndRestart()
  {
    TempRoot temp;
    WindowsLifecycleScope lifecycleScope;
    auto host = ActivateFromModule<winrt::Microsoft::ReactNative::ReactNativeHost>(L"Microsoft.ReactNative.dll");
    auto settings = host.InstanceSettings();
    auto initialProviders = settings.PackageProviders().Size();
    StallionWindows::RegisterPackage(settings);
    Require(settings.PackageProviders().Size() == initialProviders + 1, "package provider was not registered");

    auto &core = StallionCore::Instance();
    auto config = Config();
    core.Configure(config, temp.path);
    PendingBundle(temp.path, "PROD", "live");
    core.MarkDownloaded("PROD", "live-hash");

    StallionWindows::ConfigureHost(host, settings, temp.path / L"default", L"index.windows", config, temp.path);
    Require(settings.BundleRootPath() == StallionWindows::BundleRootUri(temp.path / L"StallionProd" / L"StallionNew" / L"build"),
            "configured host did not apply the promoted OTA bundle root");
    Require(core.ActiveReleaseHash() == "live-hash", "configured host did not select mounted OTA bundle");
    Require(settings.JavaScriptBundleFile() == L"index.windows", "configured bundle file mismatch");

    auto disabledConfig = config;
    disabledConfig.enabled = false;
    core.Configure(disabledConfig, temp.path);
    std::mutex syncMutex;
    std::condition_variable syncFinished;
    bool syncCompleted = false;
    UpdateCallbackScope callbackScope;
    StallionUpdateManager::Instance().SetEventCallback([&](std::string const &event) {
      if (event.find("SYNC_STATUS_ERROR") == std::string::npos) return;
      { std::scoped_lock lock(syncMutex); syncCompleted = true; }
      syncFinished.notify_one();
    });
    StallionWindows::SetActive(true);
    {
      std::unique_lock lock(syncMutex);
      Require(syncFinished.wait_for(lock, std::chrono::seconds(5), [&] { return syncCompleted; }),
              "initial activation did not complete its sync");
    }
    StallionWindows::SetActive(false);

    core.Configure(config, temp.path);
    PendingBundle(temp.path, "PROD", "reloaded");
    core.MarkDownloaded("PROD", "reload-hash");
    StallionWindows::Restart();
    Require(settings.BundleRootPath() == StallionWindows::BundleRootUri(temp.path / L"StallionProd" / L"StallionNew" / L"build"),
            "restart did not apply the promoted OTA bundle root");
    Require(core.ActiveReleaseHash() == "reload-hash", "restart did not apply selected OTA bundle");
    Require(settings.JavaScriptBundleFile() == L"index.windows", "restart did not apply selected bundle file");
  }

  fs::path Zip(TempRoot const &temp, std::vector<std::pair<std::string, std::string>> const &entries,
               std::string const &password = {});

  void StallionModule_MethodContracts()
  {
    TempRoot temp;
    auto &core = StallionCore::Instance();
    core.Configure(Config(), temp.path);
    core.SetSdkToken("sdk");

    Stallion module;

    std::string resolved;
    std::string rejected;
    module.getStallionConfig(::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(!resolved.empty() && rejected.empty(), "getStallionConfig did not resolve");

    resolved.clear();
    module.getStallionMeta(::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved.find("\"switchState\":\"PROD\"") != std::string::npos &&
            resolved.find("\"prodSlot\"") != std::string::npos && rejected.empty(),
            "getStallionMeta did not return slot metadata");

    resolved.clear();
    rejected.clear();
    module.toggleStallionSwitch("STAGE", ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved == "Success" && rejected.empty(), "toggleStallionSwitch did not resolve");

    resolved.clear();
    rejected.clear();
    module.toggleStallionSwitch("INVALID", ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved.empty() && rejected == "Unknown Stallion switch state", "invalid switch state was not rejected");

    resolved.clear();
    rejected.clear();
    module.toggleStallionSwitch("PROD", ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved == "Success" && rejected.empty(), "switching back to production did not resolve");

    resolved.clear();
    rejected.clear();
    module.updateSdkToken("next-sdk", ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved == "updateSdkToken success", "updateSdkToken did not resolve");

    core.AddEvent("SYNC_STATUS_COMPLETE");
    resolved.clear();
    rejected.clear();
    module.popEvents(::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved.find("SYNC_STATUS_COMPLETE") != std::string::npos, "popEvents did not return queued event");

    resolved.clear();
    rejected.clear();
    module.acknowledgeEvents("not-json", ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(rejected == "Invalid event ID JSON", "invalid acknowledge payload was not rejected");

    resolved.clear();
    rejected.clear();
    module.acknowledgeEvents("[]", ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(resolved == "Events acknowledged successfully." && rejected.empty(), "valid acknowledge payload did not resolve");

    resolved.clear();
    rejected.clear();
    module.downloadStageBundle({}, ::React::ReactPromise<std::string>(
      [&](std::string const &) { resolved = "unexpected"; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(rejected == "Invalid stage bundle metadata", "invalid stage bundle metadata was not rejected");

    resolved.clear();
    rejected.clear();
    ::React::JSValueObject incompleteBundle{{"url", "https://example.invalid/bundle.zip"}, {"hash", ""}};
    module.downloadStageBundle(std::move(incompleteBundle), ::React::ReactPromise<std::string>(
      [&](std::string const &value) { resolved = value; },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) { rejected = error.Message; }));
    Require(rejected == "Invalid or missing download URL or hash", "empty stage bundle hash was not rejected");

    auto stageArchive = Zip(temp, {{"build/index.windows.bundle", "stage-bundle"}});
    LoopbackServer stageServer(Read(stageArchive));
    std::mutex stageMutex;
    std::condition_variable stageFinished;
    bool stageCompleted = false;
    resolved.clear();
    rejected.clear();
    ::React::JSValueObject validBundle{{"url", stageServer.Url("/stage.zip")}, {"hash", "stage-hash"}};
    module.downloadStageBundle(std::move(validBundle), ::React::ReactPromise<std::string>(
      [&](std::string const &value) {
        { std::scoped_lock lock(stageMutex); resolved = value; stageCompleted = true; }
        stageFinished.notify_one();
      },
      [&](winrt::Microsoft::ReactNative::ReactError const &error) {
        { std::scoped_lock lock(stageMutex); rejected = error.Message; stageCompleted = true; }
        stageFinished.notify_one();
      }));
    {
      std::unique_lock lock(stageMutex);
      Require(stageFinished.wait_for(lock, std::chrono::seconds(5), [&] { return stageCompleted; }),
              "valid stage download did not complete");
    }
    stageServer.Finish();
    Require(resolved == "Stage download success" && rejected.empty(), "valid stage download did not resolve");

    module.restart();

    PendingBundle(temp.path, "PROD", "module-release");
    core.MarkDownloaded("PROD", "module-hash");
    Require(core.SelectBundle(temp.path / L"default", L"index.windows").isOta, "module release did not mount");
    Require(module.getActiveReleaseHash() == "module-hash", "module did not expose the active release hash");
    module.onLaunch({});
    Require(core.SelectBundle(temp.path / L"default", L"index.windows").releaseHash == "module-hash",
            "module launch did not preserve the successful release");
    std::mutex syncMutex;
    std::condition_variable syncFinished;
    bool syncCompleted = false;
    UpdateCallbackScope callbackScope;
    auto disabledConfig = Config();
    disabledConfig.enabled = false;
    core.Configure(disabledConfig, temp.path);
    StallionUpdateManager::Instance().SetEventCallback([&](std::string const &event) {
      if (event.find("SYNC_STATUS_ERROR") == std::string::npos) return;
      { std::scoped_lock lock(syncMutex); syncCompleted = true; }
      syncFinished.notify_one();
    });
    module.sync();
    {
      std::unique_lock lock(syncMutex);
      Require(syncFinished.wait_for(lock, std::chrono::seconds(5), [&] { return syncCompleted; }),
              "module sync did not delegate to the update manager");
    }
    module.addListener("STALLION_NATIVE_EVENT");
    module.removeListeners(1);
    module.removeListeners(5);
    StallionUpdateManager::Instance().SetEventCallback({});
    module.Initialize(nullptr);
  }

  fs::path Zip(TempRoot const &temp, std::vector<std::pair<std::string, std::string>> const &entries,
               std::string const &password)
  {
    auto path = temp.path / L"test.zip";
    int error{};
    auto archive = zip_open(winrt::to_string(winrt::hstring(path.wstring())).c_str(), ZIP_CREATE | ZIP_TRUNCATE, &error);
    Require(archive != nullptr, "could not create test ZIP");
    for (auto const &[name, value] : entries) {
      auto source = zip_source_buffer(archive, value.data(), value.size(), 0);
      Require(source != nullptr, "could not create test ZIP source");
      auto index = zip_file_add(archive, name.c_str(), source, ZIP_FL_ENC_UTF_8);
      if (index < 0) { zip_source_free(source); zip_discard(archive); throw std::runtime_error("could not add test ZIP entry"); }
      Require(zip_set_file_compression(archive, static_cast<zip_uint64_t>(index), ZIP_CM_DEFLATE, 6) == 0,
              "could not enable DEFLATE");
      if (!password.empty()) {
        Require(zip_file_set_encryption(archive, static_cast<zip_uint64_t>(index), ZIP_EM_AES_256, password.c_str()) == 0,
                "could not enable AES encryption");
      }
    }
    Require(zip_close(archive) == 0, "could not finalize test ZIP");
    return path;
  }

  fs::path ZipWithSymlink(TempRoot const &temp)
  {
    auto path = Zip(temp, {{"build/index.windows.bundle", "target"}, {"build/link", "target"}});
    int error{};
    auto archive = zip_open(winrt::to_string(winrt::hstring(path.wstring())).c_str(), 0, &error);
    Require(archive != nullptr, "could not reopen symlink ZIP fixture");
    Require(zip_file_set_external_attributes(archive, 1, 0, ZIP_OPSYS_UNIX, 0120777U << 16) == 0,
            "could not mark ZIP fixture entry as symlink");
    Require(zip_close(archive) == 0, "could not finalize symlink ZIP fixture");
    return path;
  }

  fs::path ZipWithDuplicateBundleEntry(TempRoot const &temp)
  {
    static std::string const bundleName = "build/index.windows.bundle";
    static std::string const placeholderName = "build/index.windows.bundlf";
    auto path = Zip(temp, {{bundleName, "A"}, {placeholderName, "B"}});

    std::ifstream input(path, std::ios::binary);
    std::string bytes((std::istreambuf_iterator<char>(input)), std::istreambuf_iterator<char>());
    Require(!input.bad(), "could not read duplicate-entry ZIP fixture");

    size_t replacements = 0;
    for (auto offset = bytes.find(placeholderName); offset != std::string::npos;
         offset = bytes.find(placeholderName, offset + bundleName.size())) {
      bytes.replace(offset, placeholderName.size(), bundleName);
      ++replacements;
    }
    Require(replacements == 2, "unexpected duplicate-entry ZIP structure");

    std::ofstream output(path, std::ios::binary | std::ios::trunc);
    output.write(bytes.data(), static_cast<std::streamsize>(bytes.size()));
    output.close();
    Require(!output.fail(), "could not write duplicate-entry ZIP fixture");
    return path;
  }

  fs::path ZipWithCorruptPayload(TempRoot const &temp)
  {
    auto path = Zip(temp, {{"build/index.windows.bundle", "bundle contents"}});
    std::ifstream input(path, std::ios::binary);
    std::string bytes((std::istreambuf_iterator<char>(input)), std::istreambuf_iterator<char>());
    Require(bytes.size() > 30 && bytes.compare(0, 4, "PK\x03\x04") == 0, "unexpected corrupt-payload ZIP structure");
    auto word = [&](size_t offset) {
      return static_cast<size_t>(static_cast<unsigned char>(bytes[offset])) |
             (static_cast<size_t>(static_cast<unsigned char>(bytes[offset + 1])) << 8);
    };
    auto payloadOffset = 30 + word(26) + word(28);
    Require(payloadOffset < bytes.size(), "ZIP payload offset was out of bounds");
    bytes[payloadOffset] ^= 0x5a;
    std::ofstream output(path, std::ios::binary | std::ios::trunc);
    output.write(bytes.data(), static_cast<std::streamsize>(bytes.size()));
    return path;
  }

  void Archive_AcceptsExpectedLayout()
  {
    TempRoot temp; auto result = StallionArchive::ExtractZip(Zip(temp, {{"build/index.windows.bundle", "B"}, {"build/assets/a.txt", "A"}}), temp.path / L"out");
    Require(result.ok, result.error.c_str()); Require(fs::exists(temp.path / L"out/build/assets/a.txt"), "asset was not extracted");
  }
  void Archive_DecryptsAes256()
  {
    TempRoot temp;
    auto archive = Zip(temp, {{"build/index.windows.bundle", "encrypted"}}, "correct horse battery staple");
    auto missing = StallionArchive::ExtractZip(archive, temp.path / L"missing");
    Require(!missing.ok && missing.error == "Encrypted ZIP requires StallionArchivePassword",
            "missing archive password error mismatch");
    auto wrong = StallionArchive::ExtractZip(archive, temp.path / L"wrong", "wrong password");
    Require(!wrong.ok && (wrong.error.starts_with("Unable to open ZIP entry:") ||
                          wrong.error.starts_with("Unable to decrypt or extract ZIP entry:")),
            "wrong archive password error mismatch");
    auto valid = StallionArchive::ExtractZip(archive, temp.path / L"valid", "correct horse battery staple");
    Require(valid.ok, valid.error.c_str());
  }
  void Archive_RejectsHostileAndMalformedInputs()
  {
    {
      TempRoot temp;
      auto result = StallionArchive::ExtractZip(temp.path / L"missing.zip", temp.path / L"out");
      Require(!result.ok && result.error.starts_with("Unable to open update archive:"),
              "missing archive did not report an open error");
    }
    std::vector<std::string> unsafeNames{
      "../escape", "build/../../escape", "/absolute", "\\absolute", "C:/drive", "build\\backslash",
      std::string(1025, 'a')};
    for (auto const &name : unsafeNames) {
      TempRoot temp; auto result = StallionArchive::ExtractZip(Zip(temp, {{name, "x"}, {"build/index.windows.bundle", "B"}}), temp.path / L"out");
      Require(!result.ok && result.error == "Unsafe or duplicate ZIP entry", "unsafe archive path error mismatch");
    }
    {
      TempRoot temp; auto result = StallionArchive::ExtractZip(ZipWithDuplicateBundleEntry(temp), temp.path / L"out");
      Require(!result.ok && result.error == "Unsafe or duplicate ZIP entry", "duplicate entry error mismatch");
    }
    {
      TempRoot temp; auto result = StallionArchive::ExtractZip(ZipWithSymlink(temp), temp.path / L"out");
      Require(!result.ok && result.error == "ZIP links are not supported", "ZIP link error mismatch");
    }
    {
      TempRoot temp; auto result = StallionArchive::ExtractZip(
        Zip(temp, {{"build", "file"}, {"build/index.windows.bundle", "bundle"}}), temp.path / L"out");
      Require(!result.ok && result.error == "Unable to create extracted update directory",
              "file/directory conflict error mismatch");
    }
    {
      TempRoot temp;
      auto oversizedDirectory = "build/" + std::string(256, 'd') + "/";
      auto result = StallionArchive::ExtractZip(
        Zip(temp, {{oversizedDirectory, ""}, {"build/index.windows.bundle", "bundle"}}), temp.path / L"out");
      Require(!result.ok && result.error == "Unable to create extracted update directory",
              "oversized extracted directory error mismatch");
    }
    {
      TempRoot temp; auto blocked = temp.path / L"blocked"; Write(blocked, "file");
      auto result = StallionArchive::ExtractZip(Zip(temp, {{"build/index.windows.bundle", "bundle"}}), blocked / L"out");
      Require(!result.ok && result.error == "Unable to create archive extraction directory",
              "unusable extraction destination error mismatch");
    }
    {
      TempRoot temp; auto result = StallionArchive::ExtractZip(ZipWithCorruptPayload(temp), temp.path / L"out");
      Require(!result.ok && result.error.starts_with("Unable to decrypt or extract ZIP entry:"),
              "corrupt ZIP payload error mismatch");
    }
    {
      TempRoot temp; auto result = StallionArchive::ExtractZip(
        Zip(temp, {{"build/index.windows.bundle", "too large"}}), temp.path / L"out", {}, 4);
      Require(!result.ok && result.error == "Expanded archive exceeds safety limit", "expanded-size error mismatch");
    }
    {
      TempRoot temp; auto result = StallionArchive::ExtractZip(
        Zip(temp, {{"build/index.android.bundle", "android bundle"}}), temp.path / L"out");
      Require(!result.ok && result.error == "Archive does not contain build/index.windows.bundle",
              "non-Windows bundle error mismatch");
    }
  }

  char const *FixtureSignature()
  {
    return
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYWNrYWdlSGFzaCI6ImNjMzNlNDE5NmI0OGNiYmFkOTRjZGI5YTAxMWRjNTk5MWU1NTg3NTlkYjA2MTdkNGQzMjA5OThjMDg3YzQ0OGMifQ."
      "VpxUM_CqbMspBZxvGdiC5vwduridHzQUUmh_h3gw7ytjqoz4u4H_piaG0ExXRWtdEOwR2xQleozfAAzKOUh0myP4r0tyHB4f0YFiYaDq7m8gLMoCiIN2Tqh6T8m2Ds6YwimR3YuO_ukmdh9kSjaU_3yRtsASt_SBYra5nEL-AlZw8X1UTt7ehphqQWSvzZ5dFpiNSFUzAW74GJBfuEBd8xqftdgC8OI0ybvx99QjlQChywq7A5i0tJiCCguMMEDwYsmISHNDqmy-fZJQPjzHZ0GRrJupw0YEvTTas_U3ySQIJgJWPTHagl5dFXnmmo6f0rhomIJXjEtVOSqvDiq0AA";
  }

  char const *FixturePublicKey()
  {
    return "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1Sp2ZkICt0dkzBVaK0MnRIdL4/hLFSqvJ98Gpsx9c9CHoZyWTgqV8VMi832MqvRLvao1zBiID9fPtOCnEFDkNZNNmraKwCVxq00o18KHVffD+r1gVOZ55M11pD57X3cY68OkaZ/7N1O8z7L7LF+DlagSZt/8AwHDGb68yymc+yULH5aC3oacQIdfbMezqBMGwOzIP+31y2sr16/vy2zTLR8YcugAj0Vl4gOis+XlI6cJj+kmc3SDbW3PwY+ShtZe49UmvzewkAgPx177MT4bBM7scukFqyJikHfSbx4IALM4/93+/YdNpRRez5ZlVJOSYJ1DswkVIvCgifYatoXr4wIDAQAB";
  }

  void RequireSignatureFailure(fs::path const &build, std::string const &key, std::string const &signature,
                               char const *expectedError)
  {
    Write(build / L".stallionsigned", signature);
    std::string error;
    Require(!StallionSignature::Verify(build, key, error), "invalid signature was accepted");
    Require(error == expectedError, ("signature error mismatch: " + error).c_str());
  }

  void Signature_ManifestAndMalformedInputs()
  {
    TempRoot temp;
    auto first = temp.path / L"first";
    auto second = temp.path / L"second";
    Write(first / L"index.windows.bundle", "B");
    Write(first / L"assets" / L"image.txt", "asset");
    Write(first / L".DS_Store", "ignored one");
    Write(first / L".stallionsigned", "ignored two");
    Write(first / L"__MACOSX" / L"metadata", "ignored three");
    Write(second / L"assets" / L"image.txt", "asset");
    Write(second / L"index.windows.bundle", "B");
    Require(StallionSignature::ComputeFolderHash(first) == StallionSignature::ComputeFolderHash(second),
            "signature manifest included metadata or depended on directory order");
    Write(second / L"assets" / L"image.txt", "changed");
    Require(StallionSignature::ComputeFolderHash(first) != StallionSignature::ComputeFolderHash(second),
            "signature manifest ignored release content changes");

    auto build = temp.path / L"signed";
    Write(build / L"index.windows.bundle", "B");
    auto key = std::string(FixturePublicKey());
    RequireSignatureFailure(build, key, "%%%.e30.AA", "Invalid base64 data");
    RequireSignatureFailure(build, key, "eyJhbGciOiJIUzI1NiJ9.e30.AA", "Signature algorithm must be RS256");
    RequireSignatureFailure(build, key, "eyJhbGciOiJSUzI1NiJ9.bm90LWpzb24.AA", "Invalid signature payload");

    auto valid = std::string(FixtureSignature());
    RequireSignatureFailure(build, "%%%", valid, "Invalid base64 data");
    RequireSignatureFailure(build, "AA==", valid, "Invalid RSA public key");
    auto finalDot = valid.rfind('.');
    RequireSignatureFailure(build, key, valid.substr(0, finalDot + 1) + "%%%", "Invalid base64 data");
  }

  bool HasExternalSigningArtifact()
  {
    return GetEnvironmentVariableW(L"STALLION_SIGNING_TEST_ZIP", nullptr, 0) > 0;
  }

  void Signature_AcceptsValidAndRejectsTamperedRelease()
  {
    static char const mismatchedPublicKey[] =
      "-----BEGIN PUBLIC KEY-----\n"
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzqo7Tw4aKuZzCFcK8O0D\n"
      "3wPS30bm6xgcamGaRDz3rdegvywP9JB4RvExRMXixAbKiugQKZdDciTKIXQgLJNj\n"
      "k09/Iy/P/gbdKmAiyGKivgeuX5eTJxmxAvqkatPsyUcelfoHSvvRZ1BS2J1fsaFW\n"
      "y4JfZnnDCufTg7Scj6LIbvmsX1JJlBhO2Hbej4rvZ4xvLzoSR4jB9cZofwhBOyBI\n"
      "rPoqKEGSH2F5aUWGcl7m2abEbU57hETA3aIMFq37pCSA9u9fxBC0MG9MWX2KG21K\n"
      "pGO0X6Ab+jgErtJfZ88Ug18IEmF90L8jdSnGArVsJ8cWaMxny5PuIiAVkYazX57y\n"
      "JQIDAQAB\n-----END PUBLIC KEY-----\n";
    auto jwt = FixtureSignature();
    TempRoot temp; auto build = temp.path / L"build";
    Write(build / L"index.windows.bundle", "B"); Write(build / L".stallionsigned", jwt);
    auto compiledPublicKey = StallionWindows::BuildConfig().publicSigningKey;
    if (!HasExternalSigningArtifact()) {
      Require(compiledPublicKey == FixturePublicKey(), "fixture public signing key was not compiled into BuildConfig");
    }
    auto publicKey = HasExternalSigningArtifact() ? std::string(FixturePublicKey()) : compiledPublicKey;
    std::string error;
    Require(StallionSignature::Verify(build, publicKey, error), error.c_str());
    Require(!StallionSignature::Verify(build, mismatchedPublicKey, error) && error == "RSA signature verification failed",
            "mismatched signing key error mismatch");
    Write(build / L".stallionsigned", "not-a-jws");
    Require(!StallionSignature::Verify(build, publicKey, error) && error == "Invalid Stallion signature file",
            "malformed signature error mismatch");
    fs::remove(build / L".stallionsigned");
    Require(!StallionSignature::Verify(build, publicKey, error) && error == "Invalid Stallion signature file",
            "missing signature error mismatch");
    Write(build / L".stallionsigned", jwt);
    Write(build / L"index.windows.bundle", "tampered");
    Require(!StallionSignature::Verify(build, publicKey, error) && error == "Signed package hash does not match release contents",
            "tampered signed release error mismatch");
  }

  void Signature_UpdateManagerEnforcesCompiledKey()
  {
    struct Scenario
    {
      char const *name;
      char const *bundle;
      char const *signature;
      char const *expectedError;
    };
    for (auto const &scenario : {
      Scenario{"valid", "B", FixtureSignature(), nullptr},
      Scenario{"tampered", "tampered", FixtureSignature(), "Signed package hash does not match release contents"},
      Scenario{"missing", "B", nullptr, "Invalid Stallion signature file"},
      Scenario{"malformed", "B", "not-a-jws", "Invalid Stallion signature file"}}) {
      TempRoot temp;
      std::vector<std::pair<std::string, std::string>> entries{{"build/index.windows.bundle", scenario.bundle}};
      if (scenario.signature) entries.emplace_back("build/.stallionsigned", scenario.signature);
      auto source = Zip(temp, entries);
      auto config = Config();
      config.publicSigningKey = FixturePublicKey();
      auto &core = StallionCore::Instance();
      core.Configure(config, temp.path);
      Start(core, temp.path);

      auto dependencies = UpdateDependencies();
      dependencies.postJson = [](auto const &, auto const &, auto const &, auto const &, auto const &) {
        return HttpResult{true, 200,
          "{\"success\":true,\"data\":{\"newBundleData\":{\"downloadUrl\":\"https://example.invalid/signed.zip\",\"checksum\":\"signed-hash\"}}}", {}};
      };
      dependencies.download = [source](auto const &, fs::path const &destination, auto const &, auto const &, auto const &, auto const &) {
        std::error_code error;
        fs::create_directories(destination.parent_path(), error);
        fs::copy_file(source, destination, fs::copy_options::overwrite_existing, error);
        return HttpResult{!error, error ? 0U : 200U, {}, error.message()};
      };
      dependencies.extract = [](fs::path const &archive, fs::path const &destination, std::string const &password) {
        return StallionArchive::ExtractZip(archive, destination, password);
      };
      dependencies.verifySignature = StallionSignature::Verify;
      StallionUpdateManager manager(std::move(dependencies));
      manager.SyncNow();
      auto events = core.PopEvents();
      if (scenario.expectedError) {
        Require(events.find("SIGNATURE_VERIFICATION_FAILED") != std::string::npos,
                "tampered signed update did not report signature failure");
        Require(events.find(scenario.expectedError) != std::string::npos,
                "signed update failure did not preserve the verifier error");
        Require(core.MetaJson().find("signed-hash") == std::string::npos,
                "invalid signed update was committed");
      } else {
        Require(events.find("DOWNLOAD_COMPLETE_PROD") != std::string::npos,
                "valid signed update did not complete");
        Require(core.MetaJson().find("signed-hash") != std::string::npos,
                "valid signed update was not staged");
      }
    }
  }

  void Signature_VerifiesOptionalExternalArtifact()
  {
    std::array<wchar_t, 32768> value{};
    auto length = GetEnvironmentVariableW(L"STALLION_SIGNING_TEST_ZIP", value.data(), static_cast<DWORD>(value.size()));
    if (!length) return;
    Require(length < value.size(), "external signing test ZIP path is too long");
    TempRoot temp;
    auto extracted = StallionArchive::ExtractZip(value.data(), temp.path / L"extracted");
    Require(extracted.ok, extracted.error.c_str());
    auto key = StallionWindows::BuildConfig().publicSigningKey;
    Require(!key.empty(), "external signing test key was not compiled into BuildConfig");
    std::string error;
    auto build = temp.path / L"extracted" / L"build";
    Require(StallionSignature::Verify(build, key, error), error.c_str());
    Write(build / L"index.windows.bundle", "tampered by signing smoke test");
    Require(!StallionSignature::Verify(build, key, error) && error == "Signed package hash does not match release contents",
            "external signed package tamper was not rejected");
  }

  struct Test { char const *name; std::function<void()> run; };
}

char const *SignatureFixtureJwt() { return FixtureSignature(); }
char const *SignatureFixturePublicKey() { return FixturePublicKey(); }

int main()
{
  winrt::init_apartment();
  std::vector<Test> tests{
    {"Signature_CoverageEntryPoints", Signature_CoverageEntryPoints},
    {"State_DefaultAndVersionInvalidation", State_DefaultAndVersionInvalidation},
    {"State_DefaultStorageRootIsNamespaced", State_DefaultStorageRootIsNamespaced},
    {"State_CrashRollsBackAndDoesNotRedownloadHash", State_CrashRollsBackAndDoesNotRedownloadHash},
    {"State_StableFallbackSurvivesBadReplacement", State_StableFallbackSurvivesBadReplacement},
    {"State_StageFailureIsIsolated", State_StageFailureIsIsolated},
    {"State_CorruptSelectedBundlesRollback", State_CorruptSelectedBundlesRollback},
    {"State_ExplicitStageRollbackAndProductionStabilization", State_ExplicitStageRollbackAndProductionStabilization},
    {"Events_BatchAndAcknowledge", Events_BatchAndAcknowledge},
    {"Network_MetadataContractAndPlatformSelection", Network_MetadataContractAndPlatformSelection},
    {"Network_DownloadResumeStorageAndErrors", Network_DownloadResumeStorageAndErrors},
    {"UpdateManager_MetadataOutcomes", UpdateManager_MetadataOutcomes},
    {"UpdateManager_DownloadOrchestration", UpdateManager_DownloadOrchestration},
    {"UpdateManager_DownloadFailuresAndRollback", UpdateManager_DownloadFailuresAndRollback},
    {"Windows_ConfigUriAndUnconfiguredLifecycle", Windows_ConfigUriAndUnconfiguredLifecycle},
    {"StallionModule_MethodContracts", StallionModule_MethodContracts},
    {"Windows_RegisterConfigureActiveAndRestart", Windows_RegisterConfigureActiveAndRestart},
    {"Archive_AcceptsExpectedLayout", Archive_AcceptsExpectedLayout},
    {"Archive_DecryptsAes256", Archive_DecryptsAes256},
    {"Archive_RejectsHostileAndMalformedInputs", Archive_RejectsHostileAndMalformedInputs},
    {"Signature_AcceptsValidAndRejectsTamperedRelease", Signature_AcceptsValidAndRejectsTamperedRelease},
    {"Signature_ManifestAndMalformedInputs", Signature_ManifestAndMalformedInputs},
    {"Signature_UpdateManagerEnforcesCompiledKey", Signature_UpdateManagerEnforcesCompiledKey},
    {"Signature_VerifiesOptionalExternalArtifact", Signature_VerifiesOptionalExternalArtifact},
  };
  int failed = 0;
  for (auto const &test : tests) {
    try { test.run(); std::cout << "PASS " << test.name << '\n'; }
    catch (std::exception const &error) { ++failed; std::cerr << "FAIL " << test.name << ": " << error.what() << '\n'; }
  }
  return failed == 0 ? 0 : 1;
}
