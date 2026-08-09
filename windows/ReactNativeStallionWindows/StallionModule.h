#pragma once

#include <NativeModules.h>

namespace winrt::ReactNativeStallionWindows::implementation
{
  REACT_MODULE(Stallion)
  struct Stallion
  {
    REACT_INIT(Initialize)
    void Initialize(winrt::Microsoft::ReactNative::ReactContext const &context) noexcept;

    REACT_METHOD(onLaunch)
    void onLaunch(std::string launchData) noexcept;
    REACT_METHOD(sync)
    void sync() noexcept;
    REACT_METHOD(downloadStageBundle)
    void downloadStageBundle(::React::JSValueObject &&bundleInfo, ::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(getStallionConfig)
    void getStallionConfig(::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(getStallionMeta)
    void getStallionMeta(::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(toggleStallionSwitch)
    void toggleStallionSwitch(std::string state, ::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(updateSdkToken)
    void updateSdkToken(std::string token, ::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(popEvents)
    void popEvents(::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(acknowledgeEvents)
    void acknowledgeEvents(std::string idsJson, ::React::ReactPromise<std::string> &&result) noexcept;
    REACT_METHOD(restart)
    void restart() noexcept;
    REACT_SYNC_METHOD(getActiveReleaseHash)
    std::string getActiveReleaseHash() noexcept;
    REACT_METHOD(addListener)
    void addListener(std::string eventName) noexcept;
    REACT_METHOD(removeListeners)
    void removeListeners(double count) noexcept;

  private:
    winrt::Microsoft::ReactNative::ReactContext context_{nullptr};
    std::atomic<int64_t> listeners_{0};
  };
}
