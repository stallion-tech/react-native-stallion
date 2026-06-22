#pragma once

#include <atomic>
#include <functional>
#include <mutex>
#include <string>
#include "StallionConfig.h"
#include "StallionArchive.h"
#include "StallionNetwork.h"

namespace ReactNativeStallionWindows
{
  struct StallionUpdateDependencies
  {
    std::function<HttpResult(std::string const &, std::string const &, std::string const &, std::string const &, std::string const &)> postJson;
    std::function<HttpResult(std::string const &, std::filesystem::path const &, std::string const &, std::string const &,
                             std::string const &, std::function<void(double)> const &)> download;
    std::function<ArchiveResult(std::filesystem::path const &, std::filesystem::path const &, std::string const &)> extract;
    std::function<bool(std::filesystem::path const &, std::string const &, std::string &)> verifySignature;
  };

  class StallionUpdateManager
  {
  public:
    using EventCallback = std::function<void(std::string const &)>;
    static RNSTALLION_API StallionUpdateManager &Instance() noexcept;
    RNSTALLION_API StallionUpdateManager();
    explicit RNSTALLION_API StallionUpdateManager(StallionUpdateDependencies dependencies);

    RNSTALLION_API void SetEventCallback(EventCallback callback);
    RNSTALLION_API void SyncAsync();
    RNSTALLION_API void SyncNow();
    RNSTALLION_API void DownloadStageAsync(std::string url, std::string hash, std::function<void(std::string)> resolve,
                                          std::function<void(std::string)> reject);
    static RNSTALLION_API std::string BuildMetadataPayload(StallionConfig const &config, std::string const &appliedHash,
                                                           std::string const &uid);

  private:
    void Sync();
    bool DownloadRelease(std::string const &channel, std::string const &url, std::string const &hash,
                         std::string const &diffId, std::string &error);
    void Emit(std::string const &type, std::string const &hash = {}, std::string const &meta = {},
              std::optional<double> progress = std::nullopt, std::string const &diffId = {});

    std::atomic<bool> syncInProgress_{false};
    std::atomic<bool> downloadInProgress_{false};
    std::mutex callbackMutex_;
    EventCallback callback_;
    StallionUpdateDependencies dependencies_;
  };
}
