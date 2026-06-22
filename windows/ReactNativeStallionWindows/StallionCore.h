#pragma once

#include "StallionConfig.h"
#include <winrt/Windows.Data.Json.h>

#include <filesystem>
#include <mutex>
#include <optional>
#include <string>
#include <vector>

namespace ReactNativeStallionWindows
{
  struct BundleSelection
  {
    bool isOta{false};
    std::filesystem::path rootPath;
    std::wstring bundleFile;
    std::string releaseHash;
  };

#ifdef _MSC_VER
#pragma warning(push)
#pragma warning(disable : 4251)
#endif
  class RNSTALLION_API StallionCore
  {
  public:
    static StallionCore &Instance() noexcept;

    void Configure(StallionConfig config, std::filesystem::path storageRoot);
    StallionConfig Config() const;
    std::filesystem::path StorageRoot() const;

    BundleSelection SelectBundle(
      std::filesystem::path const &defaultRoot,
      std::wstring const &defaultBundleFile);
    void MarkLaunchSuccessful();
    void HandleInstanceLoadFailure(std::string const &message);
    void SetSwitchState(std::string const &state);
    void SetSdkToken(std::string const &token);

    std::string ConfigJson() const;
    std::string MetaJson() const;
    std::string ActiveReleaseHash() const;

    void MarkDownloaded(std::string const &channel, std::string const &hash);
    void RollbackProduction(bool automatic, std::string const &reason);
    void RollbackStage(std::string const &reason);
    void StabilizeProduction();

    void AddEvent(
      std::string const &type,
      std::string const &releaseHash = {},
      std::string const &meta = {},
      std::optional<double> progress = std::nullopt,
      std::string const &diffId = {});
    std::string PopEvents() const;
    void AcknowledgeEvents(std::vector<std::string> const &ids);

    static std::filesystem::path DefaultStorageRoot();

  private:
    StallionCore() = default;
    void EnsureInitializedLocked() const;
    void LoadLocked() const;
    void SaveLocked() const;
    void SaveEventsLocked() const;
    void ResetSlotsLocked();
    void PromotePendingLocked(std::string const &channel);
    bool ValidateBundleLocked(std::filesystem::path const &slot) const;
    std::filesystem::path ChannelRootLocked(std::string const &channel) const;
    void RollbackProductionLocked(bool automatic, std::string const &reason);
    void AddEventLocked(
      std::string const &type,
      std::string const &releaseHash,
      std::string const &meta,
      std::optional<double> progress,
      std::string const &diffId) const;

    mutable std::mutex mutex_;
    mutable bool loaded_{false};
    mutable winrt::Windows::Data::Json::JsonObject meta_{nullptr};
    mutable winrt::Windows::Data::Json::JsonObject events_{nullptr};
    StallionConfig config_;
    std::filesystem::path storageRoot_;
  };
#ifdef _MSC_VER
#pragma warning(pop)
#endif
}
