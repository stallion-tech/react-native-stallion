#pragma once

#include "StallionConfig.h"
#include <filesystem>
#include <winrt/Microsoft.ReactNative.h>

namespace ReactNativeStallionWindows
{
  class RNSTALLION_API StallionWindows final
  {
  public:
    static StallionConfig BuildConfig();
    static std::wstring BundleRootUri(std::filesystem::path const &path);
    static void RegisterPackage(winrt::Microsoft::ReactNative::ReactInstanceSettings const &settings);
    static void ConfigureHost(
      winrt::Microsoft::ReactNative::ReactNativeHost const &host,
      winrt::Microsoft::ReactNative::ReactInstanceSettings const &settings,
      std::filesystem::path const &defaultBundleRoot,
      std::wstring const &defaultBundleFile,
      StallionConfig const &config,
      std::filesystem::path const &storageRoot = {});
    static void SetActive(bool active);
    static void Restart();
    static void Shutdown();
  };
}
