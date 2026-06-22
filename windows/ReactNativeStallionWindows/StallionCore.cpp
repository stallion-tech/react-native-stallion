#include "pch.h"
#include "StallionCore.h"

#include <iomanip>
#include <sstream>

using namespace winrt::Windows::Data::Json;
namespace fs = std::filesystem;

namespace
{
  constexpr wchar_t kMetaFile[] = L"meta.json";
  constexpr wchar_t kEventsFile[] = L"events.json";
  constexpr wchar_t kBundlePath[] = L"index.windows.bundle";
  constexpr wchar_t kBundleFile[] = L"index.windows";

  std::string ToUtf8(std::wstring const &value)
  {
    if (value.empty()) return {};
    int size = WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr, nullptr);
    std::string result(static_cast<size_t>(size), '\0');
    WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), size, nullptr, nullptr);
    return result;
  }

  std::wstring ToWide(std::string const &value)
  {
    if (value.empty()) return {};
    int size = MultiByteToWideChar(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0);
    std::wstring result(static_cast<size_t>(size), L'\0');
    MultiByteToWideChar(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), size);
    return result;
  }

  std::string ReadText(fs::path const &path)
  {
    std::ifstream input(path, std::ios::binary);
    if (!input) return {};
    return {std::istreambuf_iterator<char>(input), std::istreambuf_iterator<char>()};
  }

  void AtomicWrite(fs::path const &path, std::string const &value)
  {
    fs::create_directories(path.parent_path());
    auto temp = path;
    temp += L".tmp";
    {
      std::ofstream output(temp, std::ios::binary | std::ios::trunc);
      if (!output) throw std::runtime_error("Unable to open Stallion state file");
      output.write(value.data(), static_cast<std::streamsize>(value.size()));
      output.flush();
      if (!output) throw std::runtime_error("Unable to write Stallion state file");
    }
    if (!MoveFileExW(temp.c_str(), path.c_str(), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)) {
      fs::remove(temp);
      throw std::runtime_error("Unable to commit Stallion state file");
    }
  }

  std::string GetString(JsonObject const &object, wchar_t const *key, std::string const &fallback = {})
  {
    if (!object || !object.HasKey(key)) return fallback;
    try { return winrt::to_string(object.GetNamedString(key)); } catch (...) { return fallback; }
  }

  bool GetBool(JsonObject const &object, wchar_t const *key, bool fallback = false)
  {
    if (!object || !object.HasKey(key)) return fallback;
    try { return object.GetNamedBoolean(key); } catch (...) { return fallback; }
  }

  void PutString(JsonObject const &object, wchar_t const *key, std::string const &value)
  {
    object.SetNamedValue(key, JsonValue::CreateStringValue(winrt::to_hstring(value)));
  }

  void PutBool(JsonObject const &object, wchar_t const *key, bool value)
  {
    object.SetNamedValue(key, JsonValue::CreateBooleanValue(value));
  }

  int64_t EpochMilliseconds()
  {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now().time_since_epoch()).count();
  }

  std::string NewId()
  {
    GUID guid{};
    CoCreateGuid(&guid);
    wchar_t value[40]{};
    StringFromGUID2(guid, value, 40);
    auto result = ToUtf8(value);
    if (result.size() >= 2 && result.front() == '{' && result.back() == '}')
      return result.substr(1, result.size() - 2);
    return result;
  }
}

namespace ReactNativeStallionWindows
{
  StallionCore &StallionCore::Instance() noexcept
  {
    static StallionCore instance;
    return instance;
  }

  void StallionCore::Configure(StallionConfig config, fs::path storageRoot)
  {
    std::scoped_lock lock(mutex_);
    config_ = std::move(config);
    storageRoot_ = std::move(storageRoot);
    loaded_ = false;
    LoadLocked();
  }

  StallionConfig StallionCore::Config() const
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    return config_;
  }

  fs::path StallionCore::StorageRoot() const
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    return storageRoot_;
  }

  fs::path StallionCore::DefaultStorageRoot()
  {
    fs::path base;
    try {
      base = winrt::Windows::Storage::ApplicationData::Current().LocalFolder().Path().c_str();
    } catch (...) {
      PWSTR raw = nullptr;
      if (SUCCEEDED(SHGetKnownFolderPath(FOLDERID_LocalAppData, KF_FLAG_CREATE, nullptr, &raw))) {
        base = raw;
        CoTaskMemFree(raw);
      }
    }
    if (base.empty()) base = fs::temp_directory_path();
    return base / L"ReactNativeStallion";
  }

  void StallionCore::EnsureInitializedLocked() const
  {
    if (storageRoot_.empty()) {
      const_cast<StallionCore *>(this)->storageRoot_ = DefaultStorageRoot();
    }
    if (!loaded_) LoadLocked();
  }

  void StallionCore::LoadLocked() const
  {
    fs::create_directories(storageRoot_);
    auto parse = [](std::string const &text) {
      JsonObject value;
      if (!text.empty() && JsonObject::TryParse(winrt::to_hstring(text), value)) return value;
      return JsonObject{};
    };
    meta_ = parse(ReadText(storageRoot_ / kMetaFile));
    events_ = parse(ReadText(storageRoot_ / kEventsFile));
    if (!meta_.HasKey(L"switchState")) PutString(meta_, L"switchState", "PROD");
    if (!meta_.HasKey(L"currentProdSlot")) PutString(meta_, L"currentProdSlot", "DEFAULT_SLOT");
    if (!meta_.HasKey(L"currentStageSlot")) PutString(meta_, L"currentStageSlot", "DEFAULT_SLOT");
    if (!meta_.HasKey(L"uid")) {
      PutString(meta_, L"uid", NewId());
    } else {
      auto uid = GetString(meta_, L"uid");
      if (uid.size() >= 2 && uid.front() == '{' && uid.back() == '}')
        PutString(meta_, L"uid", uid.substr(1, uid.size() - 2));
    }
    loaded_ = true;
  }

  void StallionCore::SaveLocked() const
  {
    AtomicWrite(storageRoot_ / kMetaFile, winrt::to_string(meta_.Stringify()));
  }

  void StallionCore::SaveEventsLocked() const
  {
    AtomicWrite(storageRoot_ / kEventsFile, winrt::to_string(events_.Stringify()));
  }

  fs::path StallionCore::ChannelRootLocked(std::string const &channel) const
  {
    return storageRoot_ / (channel == "STAGE" ? L"StallionStage" : L"StallionProd");
  }

  bool StallionCore::ValidateBundleLocked(fs::path const &slot) const
  {
    std::error_code error;
    auto bundle = slot / L"build" / kBundlePath;
    return fs::is_regular_file(bundle, error) && fs::file_size(bundle, error) > 0 && !error;
  }

  void StallionCore::ResetSlotsLocked()
  {
    std::error_code error;
    fs::remove_all(ChannelRootLocked("PROD"), error);
    fs::remove_all(ChannelRootLocked("STAGE"), error);
    for (auto key : {L"prodTempHash", L"prodNewHash", L"prodStableHash", L"stageTempHash", L"stageNewHash", L"lastRolledBackHash"}) {
      PutString(meta_, key, "");
    }
    PutString(meta_, L"currentProdSlot", "DEFAULT_SLOT");
    PutString(meta_, L"currentStageSlot", "DEFAULT_SLOT");
    PutBool(meta_, L"launchPending", false);
  }

  void StallionCore::PromotePendingLocked(std::string const &channel)
  {
    auto prefix = channel == "STAGE" ? L"stage" : L"prod";
    auto tempHashKey = std::wstring(prefix) + L"TempHash";
    auto newHashKey = std::wstring(prefix) + L"NewHash";
    auto pendingHash = GetString(meta_, tempHashKey.c_str());
    if (pendingHash.empty()) return;

    auto root = ChannelRootLocked(channel);
    auto temp = root / L"temp";
    auto next = root / L"StallionNew";
    if (!ValidateBundleLocked(temp)) {
      fs::remove_all(temp);
      PutString(meta_, tempHashKey.c_str(), "");
      AddEventLocked(channel == "STAGE" ? "DOWNLOAD_ERROR_STAGE" : "CORRUPTED_FILE_ERROR", pendingHash, "Pending bundle is missing or empty", {}, {});
      return;
    }

    std::error_code error;
    fs::remove_all(next, error);
    fs::rename(temp, next, error);
    if (error) {
      AddEventLocked(channel == "STAGE" ? "DOWNLOAD_ERROR_STAGE" : "FILE_MOUNTING_ERROR", pendingHash, error.message(), {}, {});
      return;
    }
    PutString(meta_, newHashKey.c_str(), pendingHash);
    PutString(meta_, tempHashKey.c_str(), "");
    PutString(meta_, channel == "STAGE" ? L"currentStageSlot" : L"currentProdSlot", "NEW_SLOT");
    AddEventLocked(channel == "STAGE" ? "INSTALLED_STAGE" : "INSTALLED_PROD", pendingHash, {}, {}, {});
  }

  BundleSelection StallionCore::SelectBundle(fs::path const &defaultRoot, std::wstring const &defaultBundleFile)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    BundleSelection result{false, defaultRoot, defaultBundleFile, {}};
    if (!config_.enabled) return result;

    auto cachedVersion = GetString(meta_, L"appVersion");
    if (!cachedVersion.empty() && cachedVersion != config_.appVersion) {
      ResetSlotsLocked();
    }
    if (cachedVersion != config_.appVersion) {
      PutString(meta_, L"appVersion", config_.appVersion);
    }
    if (GetBool(meta_, L"launchPending")) {
      RollbackProductionLocked(true, "Previous OTA bundle did not reach onLaunch");
    }

    auto channel = GetString(meta_, L"switchState", "PROD");
    PromotePendingLocked(channel);
    auto slotName = GetString(meta_, channel == "STAGE" ? L"currentStageSlot" : L"currentProdSlot", "DEFAULT_SLOT");
    fs::path slot;
    std::string hash;
    if (slotName == "NEW_SLOT") {
      slot = ChannelRootLocked(channel) / L"StallionNew";
      hash = GetString(meta_, channel == "STAGE" ? L"stageNewHash" : L"prodNewHash");
    } else if (channel == "PROD" && slotName == "STABLE_SLOT") {
      slot = ChannelRootLocked(channel) / L"StallionStable";
      hash = GetString(meta_, L"prodStableHash");
    }

    if (!slot.empty() && ValidateBundleLocked(slot)) {
      result = {true, slot / L"build", kBundleFile, hash};
      PutBool(meta_, L"launchPending", true);
      PutString(meta_, L"launchHash", hash);
    } else if (!slot.empty()) {
      if (channel == "STAGE") {
        PutString(meta_, L"currentStageSlot", "DEFAULT_SLOT");
        auto hash = GetString(meta_, L"stageNewHash");
        PutString(meta_, L"stageNewHash", "");
        AddEventLocked("DOWNLOAD_ERROR_STAGE", hash, "Selected stage bundle is corrupt", {}, {});
      } else RollbackProductionLocked(false, "Selected production bundle is corrupt");
    }
    SaveLocked();
    SaveEventsLocked();
    return result;
  }

  void StallionCore::MarkLaunchSuccessful()
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    PutBool(meta_, L"launchPending", false);
    PutString(meta_, L"lastSuccessfulHash", GetString(meta_, L"launchHash"));
    SaveLocked();
  }

  void StallionCore::HandleInstanceLoadFailure(std::string const &message)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    if (GetString(meta_, L"switchState", "PROD") == "STAGE") {
      auto hash = GetString(meta_, L"stageNewHash");
      PutString(meta_, L"stageNewHash", "");
      PutString(meta_, L"currentStageSlot", "DEFAULT_SLOT");
      AddEventLocked("DOWNLOAD_ERROR_STAGE", hash, message, {}, {});
    } else {
      RollbackProductionLocked(true, message);
    }
    PutBool(meta_, L"launchPending", false);
    SaveLocked();
    SaveEventsLocked();
  }

  void StallionCore::SetSwitchState(std::string const &state)
  {
    if (state != "PROD" && state != "STAGE") throw std::invalid_argument("Unknown Stallion switch state");
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    PutString(meta_, L"switchState", state);
    SaveLocked();
  }

  void StallionCore::SetSdkToken(std::string const &token)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    PutString(meta_, L"sdkToken", token);
    SaveLocked();
  }

  std::string StallionCore::ConfigJson() const
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    JsonObject value;
    PutString(value, L"uid", GetString(meta_, L"uid"));
    PutString(value, L"projectId", config_.projectId);
    PutString(value, L"appToken", config_.appToken);
    PutString(value, L"sdkToken", GetString(meta_, L"sdkToken"));
    PutString(value, L"appVersion", config_.appVersion);
    PutString(value, L"baseUrl", config_.baseUrl);
    PutString(value, L"platformIdentity", config_.platformIdentity);
    return winrt::to_string(value.Stringify());
  }

  std::string StallionCore::MetaJson() const
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    JsonObject value;
    PutString(value, L"switchState", GetString(meta_, L"switchState", "PROD"));
    JsonObject prod;
    PutString(prod, L"currentSlot", GetString(meta_, L"currentProdSlot", "DEFAULT_SLOT"));
    PutString(prod, L"stableHash", GetString(meta_, L"prodStableHash"));
    PutString(prod, L"newHash", GetString(meta_, L"prodNewHash"));
    PutString(prod, L"tempHash", GetString(meta_, L"prodTempHash"));
    value.SetNamedValue(L"prodSlot", prod);
    JsonObject stage;
    PutString(stage, L"currentSlot", GetString(meta_, L"currentStageSlot", "DEFAULT_SLOT"));
    PutString(stage, L"newHash", GetString(meta_, L"stageNewHash"));
    PutString(stage, L"tempHash", GetString(meta_, L"stageTempHash"));
    value.SetNamedValue(L"stageSlot", stage);
    return winrt::to_string(value.Stringify());
  }

  std::string StallionCore::ActiveReleaseHash() const
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    auto channel = GetString(meta_, L"switchState", "PROD");
    auto slot = GetString(meta_, channel == "STAGE" ? L"currentStageSlot" : L"currentProdSlot");
    if (channel == "STAGE") return slot == "NEW_SLOT" ? GetString(meta_, L"stageNewHash") : "";
    if (slot == "NEW_SLOT") return GetString(meta_, L"prodNewHash");
    return slot == "STABLE_SLOT" ? GetString(meta_, L"prodStableHash") : "";
  }

  void StallionCore::MarkDownloaded(std::string const &channel, std::string const &hash)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    if (channel == "PROD" && !GetString(meta_, L"prodNewHash").empty()) {
      auto source = ChannelRootLocked("PROD") / L"StallionNew";
      auto target = ChannelRootLocked("PROD") / L"StallionStable";
      std::error_code error;
      fs::remove_all(target, error);
      fs::copy(source, target, fs::copy_options::recursive | fs::copy_options::overwrite_existing, error);
      if (!error) {
        PutString(meta_, L"prodStableHash", GetString(meta_, L"prodNewHash"));
        AddEventLocked("STABILIZED_PROD", GetString(meta_, L"prodNewHash"), {}, {}, {});
      }
    }
    PutString(meta_, channel == "STAGE" ? L"stageTempHash" : L"prodTempHash", hash);
    SaveLocked();
    SaveEventsLocked();
  }

  void StallionCore::RollbackProductionLocked(bool automatic, std::string const &reason)
  {
    auto slot = GetString(meta_, L"currentProdSlot", "DEFAULT_SLOT");
    auto hash = slot == "NEW_SLOT" ? GetString(meta_, L"prodNewHash") : GetString(meta_, L"prodStableHash");
    if (slot == "NEW_SLOT") {
      PutString(meta_, L"prodNewHash", "");
      PutString(meta_, L"currentProdSlot", GetString(meta_, L"prodStableHash").empty() ? "DEFAULT_SLOT" : "STABLE_SLOT");
    } else if (slot == "STABLE_SLOT") {
      PutString(meta_, L"prodStableHash", "");
      PutString(meta_, L"currentProdSlot", "DEFAULT_SLOT");
    } else return;
    if (automatic) PutString(meta_, L"lastRolledBackHash", hash);
    AddEventLocked(automatic ? "AUTO_ROLLED_BACK_PROD" : "ROLLED_BACK_PROD", hash, reason, {}, {});
  }

  void StallionCore::RollbackProduction(bool automatic, std::string const &reason)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    RollbackProductionLocked(automatic, reason);
    SaveLocked();
    SaveEventsLocked();
  }

  void StallionCore::RollbackStage(std::string const &reason)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    PutString(meta_, L"currentStageSlot", "DEFAULT_SLOT");
    auto hash = GetString(meta_, L"stageNewHash");
    PutString(meta_, L"stageNewHash", "");
    AddEventLocked("DOWNLOAD_ERROR_STAGE", hash, reason, {}, {});
    SaveLocked();
    SaveEventsLocked();
  }

  void StallionCore::StabilizeProduction()
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    auto hash = GetString(meta_, L"prodNewHash");
    if (hash.empty()) return;
    std::error_code error;
    auto target = ChannelRootLocked("PROD") / L"StallionStable";
    fs::remove_all(target, error);
    fs::copy(ChannelRootLocked("PROD") / L"StallionNew", target, fs::copy_options::recursive | fs::copy_options::overwrite_existing, error);
    if (!error) {
      PutString(meta_, L"prodStableHash", hash);
      AddEventLocked("STABILIZED_PROD", hash, {}, {}, {});
      SaveLocked();
      SaveEventsLocked();
    }
  }

  void StallionCore::AddEventLocked(std::string const &type, std::string const &releaseHash, std::string const &meta,
                                    std::optional<double> progress, std::string const &diffId) const
  {
    if (events_.Size() >= 60) events_ = JsonObject{};
    auto id = NewId();
    JsonObject event;
    PutString(event, L"eventId", id);
    PutString(event, L"eventType", type);
    PutString(event, L"releaseHash", releaseHash);
    if (!meta.empty()) PutString(event, L"meta", meta.substr(0, 900));
    if (!diffId.empty()) PutString(event, L"diffId", diffId);
    if (progress) event.SetNamedValue(L"progress", JsonValue::CreateNumberValue(*progress));
    event.SetNamedValue(L"eventTimestamp", JsonValue::CreateNumberValue(static_cast<double>(EpochMilliseconds())));
    PutString(event, L"projectId", config_.projectId);
    PutString(event, L"platform", "windows");
    PutString(event, L"appVersion", config_.appVersion);
    PutString(event, L"uid", GetString(meta_, L"uid"));
    PutString(event, L"sdkVersion", config_.sdkVersion);
    events_.SetNamedValue(winrt::to_hstring(id), JsonValue::CreateStringValue(event.Stringify()));
  }

  void StallionCore::AddEvent(std::string const &type, std::string const &releaseHash, std::string const &meta,
                              std::optional<double> progress, std::string const &diffId)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    AddEventLocked(type, releaseHash, meta, progress, diffId);
    SaveEventsLocked();
  }

  std::string StallionCore::PopEvents() const
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    JsonArray batch;
    uint32_t count = 0;
    for (auto const &entry : events_) {
      if (count++ == 9) break;
      JsonObject event;
      if (JsonObject::TryParse(entry.Value().GetString(), event)) batch.Append(event);
    }
    return winrt::to_string(batch.Stringify());
  }

  void StallionCore::AcknowledgeEvents(std::vector<std::string> const &ids)
  {
    std::scoped_lock lock(mutex_);
    EnsureInitializedLocked();
    for (auto const &id : ids) events_.Remove(winrt::to_hstring(id));
    SaveEventsLocked();
  }
}
