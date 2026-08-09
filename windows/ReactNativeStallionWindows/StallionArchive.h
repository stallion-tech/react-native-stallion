#pragma once

#include "StallionConfig.h"

#include <filesystem>
#include <string>

namespace ReactNativeStallionWindows
{
  struct ArchiveResult
  {
    bool ok{false};
    std::string error;
  };

  class RNSTALLION_API StallionArchive
  {
  public:
    static ArchiveResult ExtractZip(
      std::filesystem::path const &archive,
      std::filesystem::path const &destination,
      std::string const &password = {},
      uint64_t maximumExpandedBytes = 512ull * 1024ull * 1024ull) noexcept;
  };
}
