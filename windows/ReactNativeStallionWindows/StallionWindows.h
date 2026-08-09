#pragma once

#include "StallionConfig.h"
#if __has_include("StallionWindows.g.h")
#include "StallionWindows.g.h"
#define RNSTALLION_HAS_WINRT_FACADE 1
#endif
#include <cstdint>
#include <filesystem>
#include <winrt/Microsoft.ReactNative.h>

namespace ReactNativeStallionWindows
{
  class RNSTALLION_API StallionWindows final
  {
  public:
    static StallionConfig BuildConfig();
    static std::string FormatPackageVersion(uint16_t major, uint16_t minor, uint16_t build, uint16_t revision);
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


#ifdef RNSTALLION_HAS_WINRT_FACADE
namespace winrt::ReactNativeStallionWindows::implementation
{
  struct StallionWindows
  {
    static void ConfigureHost(
      Microsoft::ReactNative::ReactNativeHost const &host,
      Microsoft::ReactNative::ReactInstanceSettings const &settings,
      hstring const &defaultBundleRoot,
      hstring const &defaultBundleFile,
      hstring const &storageRoot);
    static void SetActive(bool active);
    static void Restart();
    static void Shutdown();
  };
}

namespace winrt::ReactNativeStallionWindows::factory_implementation
{
  struct StallionWindows : StallionWindowsT<StallionWindows, implementation::StallionWindows> {};
}
#endif
