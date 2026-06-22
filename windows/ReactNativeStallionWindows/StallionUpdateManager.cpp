#include "pch.h"
#include "StallionUpdateManager.h"
#include "StallionArchive.h"
#include "StallionCore.h"
#include "StallionNetwork.h"
#include "StallionSignature.h"

using namespace winrt::Windows::Data::Json;
namespace fs = std::filesystem;

namespace
{
  std::string GetString(JsonObject const &value, wchar_t const *name)
  {
    try { return value && value.HasKey(name) ? winrt::to_string(value.GetNamedString(name)) : ""; } catch (...) { return {}; }
  }

  JsonObject GetObject(JsonObject const &value, wchar_t const *name)
  {
    try { return value && value.HasKey(name) ? value.GetNamedObject(name) : nullptr; } catch (...) { return nullptr; }
  }

  std::string Escape(std::string const &value)
  {
    JsonValue json = JsonValue::CreateStringValue(winrt::to_hstring(value));
    return winrt::to_string(json.Stringify());
  }

  std::string AppendProjectId(std::string url, std::string const &projectId)
  {
    url += url.find('?') == std::string::npos ? '?' : '&';
    url += "projectId=" + projectId;
    return url;
  }
}

namespace ReactNativeStallionWindows
{
  StallionUpdateManager::StallionUpdateManager() : StallionUpdateManager({
    StallionNetwork::PostJson,
    StallionNetwork::Download,
    [](fs::path const &archive, fs::path const &destination, std::string const &password) {
      return StallionArchive::ExtractZip(archive, destination, password);
    },
    StallionSignature::Verify}) {}

  StallionUpdateManager::StallionUpdateManager(StallionUpdateDependencies dependencies)
    : dependencies_(std::move(dependencies)) {}

  std::string StallionUpdateManager::BuildMetadataPayload(StallionConfig const &config,
                                                           std::string const &appliedHash,
                                                           std::string const &uid)
  {
    return std::string("{") +
      "\"appVersion\":" + Escape(config.appVersion) + "," +
      "\"platform\":" + Escape(config.platformIdentity) + "," +
      "\"projectId\":" + Escape(config.projectId) + "," +
      "\"appliedBundleHash\":" + Escape(appliedHash) + "," +
      "\"deviceMeta\":{" +
        "\"osName\":\"Windows\"," +
        "\"manufacturer\":\"Microsoft\"," +
        "\"brand\":\"Windows\"," +
        "\"model\":\"x64\"," +
        "\"device\":\"Windows\"," +
        "\"product\":\"Windows\"," +
        "\"hardware\":\"x64\"," +
        "\"isEmulator\":false," +
        "\"projectId\":" + Escape(config.projectId) + "," +
        "\"uid\":" + Escape(uid) + "," +
        "\"appVersion\":" + Escape(config.appVersion) + "}}";
  }

  StallionUpdateManager &StallionUpdateManager::Instance() noexcept
  {
    static StallionUpdateManager value;
    return value;
  }

  void StallionUpdateManager::SetEventCallback(EventCallback callback)
  {
    std::scoped_lock lock(callbackMutex_);
    callback_ = std::move(callback);
  }

  void StallionUpdateManager::Emit(std::string const &type, std::string const &hash, std::string const &meta,
                                   std::optional<double> progress, std::string const &diffId)
  {
    if (type.find("PROGRESS") == std::string::npos && type.rfind("SYNC_STATUS_", 0) != 0)
      StallionCore::Instance().AddEvent(type, hash, meta, progress, diffId);
    JsonObject body;
    body.SetNamedValue(L"type", JsonValue::CreateStringValue(winrt::to_hstring(type)));
    if (!hash.empty()) body.SetNamedValue(L"releaseHash", JsonValue::CreateStringValue(winrt::to_hstring(hash)));
    if (!meta.empty()) body.SetNamedValue(L"meta", JsonValue::CreateStringValue(winrt::to_hstring(meta)));
    if (!diffId.empty()) body.SetNamedValue(L"diffId", JsonValue::CreateStringValue(winrt::to_hstring(diffId)));
    if (progress) body.SetNamedValue(L"progress", JsonValue::CreateStringValue(winrt::to_hstring(std::to_string(*progress))));
    EventCallback callback;
    { std::scoped_lock lock(callbackMutex_); callback = callback_; }
    if (callback) callback(winrt::to_string(body.Stringify()));
  }

  void StallionUpdateManager::SyncAsync()
  {
    if (syncInProgress_.exchange(true)) return;
    std::thread([this] {
      struct Reset { std::atomic<bool> &flag; ~Reset() { flag = false; } } reset{syncInProgress_};
      try {
        winrt::init_apartment(winrt::apartment_type::multi_threaded);
        Sync();
      } catch (winrt::hresult_error const &error) {
        Emit("SYNC_ERROR_PROD", {}, winrt::to_string(error.message()));
      } catch (std::exception const &error) {
        Emit("SYNC_ERROR_PROD", {}, error.what());
      } catch (...) {
        Emit("SYNC_ERROR_PROD", {}, "Unknown update worker failure");
      }
    }).detach();
  }

  void StallionUpdateManager::SyncNow()
  {
    Sync();
  }

  void StallionUpdateManager::Sync()
  {
    auto &core = StallionCore::Instance();
    auto config = core.Config();
    Emit("SYNC_STATUS_STARTED");
    if (!config.enabled || config.projectId.empty() || config.appToken.empty()) {
      Emit("SYNC_STATUS_ERROR", {}, "Stallion is disabled or missing project credentials");
      return;
    }
    auto configJson = config.baseUrl.empty() ? "https://api-ap.stalliontech.io" : config.baseUrl;
    auto sdkTokenJson = core.ConfigJson();
    JsonObject nativeConfig;
    JsonObject::TryParse(winrt::to_hstring(sdkTokenJson), nativeConfig);
    auto sdkToken = GetString(nativeConfig, L"sdkToken");
    auto uid = GetString(nativeConfig, L"uid");
    auto payload = BuildMetadataPayload(config, core.ActiveReleaseHash(), uid);
    auto response = dependencies_.postJson(configJson + "/api/v1/promoted/get-update-meta", payload,
                                           config.appToken, sdkToken, uid);
    if (!response.ok) {
      auto detail = response.error + " (HTTP " + std::to_string(response.status) + ")";
      if (!response.body.empty()) {
        constexpr size_t maximumBodyLength = 512;
        detail += ": " + response.body.substr(0, maximumBodyLength);
        if (response.body.size() > maximumBodyLength) detail += "...";
      }
      Emit("SYNC_ERROR_PROD", {}, detail);
      return;
    }
    JsonObject root;
    if (!JsonObject::TryParse(winrt::to_hstring(response.body), root)) { Emit("SYNC_ERROR_PROD", {}, "Invalid metadata response"); return; }
    try {
      if (!root.GetNamedBoolean(L"success", false)) {
        Emit("SYNC_STATUS_ERROR", {}, "Metadata endpoint returned success=false");
        return;
      }
      auto data = GetObject(root, L"data");
      auto applied = GetObject(data, L"appliedBundleData");
      if (applied && applied.GetNamedBoolean(L"isRolledBack", false) && GetString(applied, L"targetAppVersion") == config.appVersion) {
        core.RollbackProduction(false, "Server-directed rollback");
      }
      auto release = GetObject(data, L"newBundleData");
      if (!release) { Emit("SYNC_STATUS_NO_UPDATE"); return; }
      auto url = GetString(release, L"downloadUrl");
      auto hash = GetString(release, L"checksum");
      if (url.empty() || hash.empty()) { Emit("SYNC_STATUS_ERROR", {}, "Release metadata is missing URL or checksum"); return; }
      if (hash == core.ActiveReleaseHash()) { Emit("SYNC_STATUS_NO_UPDATE"); return; }
      std::string error;
      if (DownloadRelease("PROD", url, hash, {}, error)) Emit("SYNC_STATUS_COMPLETE", hash);
    } catch (winrt::hresult_error const &error) {
      Emit("SYNC_ERROR_PROD", {}, winrt::to_string(error.message()));
    }
  }

  bool StallionUpdateManager::DownloadRelease(std::string const &channel, std::string const &url,
                                               std::string const &hash, std::string const &diffId, std::string &error)
  {
    if (downloadInProgress_.exchange(true)) { error = "Another Stallion download is active"; return false; }
    struct Reset { std::atomic<bool> &flag; ~Reset() { flag = false; } } reset{downloadInProgress_};
    auto &core = StallionCore::Instance();
    auto config = core.Config();
    JsonObject nativeConfig;
    JsonObject::TryParse(winrt::to_hstring(core.ConfigJson()), nativeConfig);
    auto sdkToken = GetString(nativeConfig, L"sdkToken");
    auto uid = GetString(nativeConfig, L"uid");
    auto root = core.StorageRoot() / (channel == "STAGE" ? L"StallionStage" : L"StallionProd");
    auto archive = root / L"download.zip";
    auto temp = root / L"temp";
    Emit(channel == "STAGE" ? "DOWNLOAD_STARTED_STAGE" : "DOWNLOAD_STARTED_PROD", hash, {}, {}, diffId);
    auto download = dependencies_.download(AppendProjectId(url, config.projectId), archive, config.appToken, sdkToken, uid,
      [this, channel, hash](double value) { Emit(channel == "STAGE" ? "DOWNLOAD_PROGRESS_STAGE" : "DOWNLOAD_PROGRESS_PROD", hash, {}, value); });
    if (!download.ok) {
      error = download.error;
      Emit(channel == "STAGE" ? "DOWNLOAD_ERROR_STAGE" : "DOWNLOAD_ERROR_PROD", hash, error);
      return false;
    }
    auto extracted = dependencies_.extract(archive, temp, config.archivePassword);
    if (!extracted.ok) {
      error = extracted.error;
      Emit(channel == "STAGE" ? "DOWNLOAD_ERROR_STAGE" : "DOWNLOAD_ERROR_PROD", hash, error);
      std::error_code ignored;
      fs::remove_all(temp, ignored);
      fs::remove(archive, ignored);
      return false;
    }
    if (!config.publicSigningKey.empty()) {
      std::string signatureError;
      if (!dependencies_.verifySignature(temp / L"build", config.publicSigningKey, signatureError)) {
        error = signatureError;
        Emit(channel == "STAGE" ? "DOWNLOAD_ERROR_STAGE" : "SIGNATURE_VERIFICATION_FAILED", hash, error);
        std::error_code ignored;
        fs::remove_all(temp, ignored);
        fs::remove(archive, ignored);
        return false;
      }
    }
    std::error_code ignored;
    fs::remove(archive, ignored);
    core.MarkDownloaded(channel, hash);
    Emit(channel == "STAGE" ? "DOWNLOAD_COMPLETE_STAGE" : "DOWNLOAD_COMPLETE_PROD", hash);
    return true;
  }

  void StallionUpdateManager::DownloadStageAsync(std::string url, std::string hash,
                                                  std::function<void(std::string)> resolve,
                                                  std::function<void(std::string)> reject)
  {
    std::thread([this, url = std::move(url), hash = std::move(hash), resolve = std::move(resolve), reject = std::move(reject)] {
      try {
        winrt::init_apartment(winrt::apartment_type::multi_threaded);
        std::string error;
        if (DownloadRelease("STAGE", url, hash, {}, error)) resolve("Stage download success");
        else reject(error);
      } catch (winrt::hresult_error const &error) {
        reject(winrt::to_string(error.message()));
      } catch (std::exception const &error) {
        reject(error.what());
      } catch (...) {
        reject("Unknown stage download worker failure");
      }
    }).detach();
  }
}
