#include "pch.h"
#include "StallionWindows.h"
#include "StallionCore.h"
#include "StallionUpdateManager.h"
#include <StallionSigningConfig.g.h>
#include <winrt/ReactNativeStallionWindows.h>

#include <condition_variable>

namespace fs = std::filesystem;

namespace
{
  struct HostState
  {
    std::mutex mutex;
    std::condition_variable wake;
    winrt::Microsoft::ReactNative::ReactNativeHost host{nullptr};
    winrt::Microsoft::ReactNative::ReactInstanceSettings settings{nullptr};
    fs::path defaultRoot;
    std::wstring defaultFile;
    std::thread timer;
    bool stopping{false};
    bool active{false};
    std::chrono::steady_clock::time_point lastSync{};
  };

  HostState &State()
  {
    static HostState value;
    return value;
  }

  void ApplySelection(ReactNativeStallionWindows::BundleSelection const &selection,
                      winrt::Microsoft::ReactNative::ReactInstanceSettings const &settings)
  {
    settings.BundleRootPath(ReactNativeStallionWindows::StallionWindows::BundleRootUri(selection.rootPath));
    settings.JavaScriptBundleFile(selection.bundleFile);
  }

  void TimerLoop()
  {
    auto &state = State();
    std::unique_lock lock(state.mutex);
    while (!state.stopping) {
      if (!state.active) {
        state.wake.wait(lock, [&] { return state.stopping || state.active; });
        continue;
      }
      auto due = state.lastSync + std::chrono::minutes(15);
      if (state.wake.wait_until(lock, due, [&] { return state.stopping || !state.active; })) continue;
      state.lastSync = std::chrono::steady_clock::now();
      lock.unlock();
      ReactNativeStallionWindows::StallionUpdateManager::Instance().SyncAsync();
      lock.lock();
    }
  }
}

namespace ReactNativeStallionWindows
{
#ifndef STALLION_ENABLED
#define STALLION_ENABLED 1
#endif
#ifndef STALLION_PROJECT_ID
#define STALLION_PROJECT_ID ""
#endif
#ifndef STALLION_APP_TOKEN
#define STALLION_APP_TOKEN ""
#endif
#ifndef STALLION_ARCHIVE_PASSWORD
#define STALLION_ARCHIVE_PASSWORD ""
#endif
#ifndef STALLION_BASE_URL
#define STALLION_BASE_URL ""
#endif
#ifndef STALLION_APP_VERSION
#define STALLION_APP_VERSION ""
#endif
#ifndef STALLION_PLATFORM
#define STALLION_PLATFORM "windows"
#endif

  StallionConfig StallionWindows::BuildConfig()
  {
    return {STALLION_ENABLED != 0, STALLION_PROJECT_ID, STALLION_APP_TOKEN, GeneratedPublicSigningKey,
            STALLION_ARCHIVE_PASSWORD, STALLION_BASE_URL, STALLION_APP_VERSION, "2.4.1-windows.1", STALLION_PLATFORM};
  }

  std::wstring StallionWindows::BundleRootUri(fs::path const &path)
  {
    auto value = path.wstring();
    std::replace(value.begin(), value.end(), L'\\', L'/');
    return L"file:///" + value + L"/";
  }

  void StallionWindows::RegisterPackage(winrt::Microsoft::ReactNative::ReactInstanceSettings const &settings)
  {
    settings.PackageProviders().Append(winrt::ReactNativeStallionWindows::ReactPackageProvider());
  }

  void StallionWindows::ConfigureHost(
    winrt::Microsoft::ReactNative::ReactNativeHost const &host,
    winrt::Microsoft::ReactNative::ReactInstanceSettings const &settings,
    fs::path const &defaultBundleRoot,
    std::wstring const &defaultBundleFile,
    StallionConfig const &config,
    fs::path const &storageRoot)
  {
    auto &state = State();
    {
      std::scoped_lock lock(state.mutex);
      state.stopping = false;
      state.host = host;
      state.settings = settings;
      state.defaultRoot = defaultBundleRoot;
      state.defaultFile = defaultBundleFile;
    }
    StallionCore::Instance().Configure(config, storageRoot.empty() ? StallionCore::DefaultStorageRoot() : storageRoot);
    ApplySelection(StallionCore::Instance().SelectBundle(defaultBundleRoot, defaultBundleFile), settings);
    settings.InstanceLoaded([](auto const &, winrt::Microsoft::ReactNative::InstanceLoadedEventArgs const &args) noexcept {
      if (args.Failed()) StallionCore::Instance().HandleInstanceLoadFailure("React Native failed to load the selected bundle");
    });
    if (!state.timer.joinable()) state.timer = std::thread(TimerLoop);
  }

  void StallionWindows::SetActive(bool active)
  {
    auto &state = State();
    bool shouldSync = false;
    {
      std::scoped_lock lock(state.mutex);
      if (active && !state.active) {
        auto now = std::chrono::steady_clock::now();
        shouldSync = now - state.lastSync >= std::chrono::minutes(1);
        if (shouldSync) state.lastSync = now;
      }
      state.active = active;
    }
    state.wake.notify_all();
    if (shouldSync) StallionUpdateManager::Instance().SyncAsync();
  }

  void StallionWindows::Restart()
  {
    auto &state = State();
    winrt::Microsoft::ReactNative::ReactNativeHost host{nullptr};
    winrt::Microsoft::ReactNative::ReactInstanceSettings settings{nullptr};
    fs::path root;
    std::wstring file;
    {
      std::scoped_lock lock(state.mutex);
      host = state.host;
      settings = state.settings;
      root = state.defaultRoot;
      file = state.defaultFile;
    }
    if (!host || !settings) return;
    ApplySelection(StallionCore::Instance().SelectBundle(root, file), settings);
    host.ReloadInstance();
  }

  void StallionWindows::Shutdown()
  {
    auto &state = State();
    {
      std::scoped_lock lock(state.mutex);
      state.stopping = true;
    }
    state.wake.notify_all();
    if (state.timer.joinable()) state.timer.join();
    {
      std::scoped_lock lock(state.mutex);
      state.host = nullptr;
      state.settings = nullptr;
      state.defaultRoot.clear();
      state.defaultFile.clear();
      state.active = false;
      state.lastSync = {};
    }
  }
}
