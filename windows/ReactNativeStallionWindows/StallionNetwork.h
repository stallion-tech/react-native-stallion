#pragma once
#include "StallionConfig.h"

#include <filesystem>
#include <functional>
#include <string>

namespace ReactNativeStallionWindows
{
  struct HttpResult
  {
    bool ok{false};
    uint32_t status{0};
    std::string body;
    std::string error;
  };

  class DownloadFile
  {
  public:
    virtual ~DownloadFile() = default;
    virtual uint64_t ExistingSize() noexcept = 0;
    virtual bool Open(bool append) noexcept = 0;
    virtual bool Write(char const *data, size_t size) noexcept = 0;
  };

  class StallionNetwork
  {
  public:
    static RNSTALLION_API HttpResult PostJson(
      std::string const &url,
      std::string const &body,
      std::string const &appToken,
      std::string const &sdkToken,
      std::string const &uid) noexcept;

    static RNSTALLION_API HttpResult Download(
      std::string const &url,
      std::filesystem::path const &destination,
      std::string const &appToken,
      std::string const &sdkToken,
      std::string const &uid,
      std::function<void(double)> const &onProgress) noexcept;

    static RNSTALLION_API HttpResult DownloadToFile(
      std::string const &url,
      DownloadFile &file,
      std::string const &appToken,
      std::string const &sdkToken,
      std::string const &uid,
      std::function<void(double)> const &onProgress) noexcept;
  };
}
