#pragma once

#include "StallionConfig.h"
#include <filesystem>
#include <string>

namespace ReactNativeStallionWindows
{
  class RNSTALLION_API StallionSignature
  {
  public:
    static bool Verify(std::filesystem::path const &buildDirectory, std::string const &publicKeyPem,
                       std::string &error) noexcept;
    static std::string ComputeFolderHash(std::filesystem::path const &buildDirectory);
  };
}
