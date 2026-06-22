#include "pch.h"
#include "StallionModule.h"
#include "StallionCore.h"
#include "StallionUpdateManager.h"
#include "StallionWindows.h"

using namespace winrt::Windows::Data::Json;

namespace winrt::ReactNativeStallionWindows::implementation
{
  void Stallion::Initialize(winrt::Microsoft::ReactNative::ReactContext const &context) noexcept
  {
    context_ = context;
    ::ReactNativeStallionWindows::StallionUpdateManager::Instance().SetEventCallback(
      [context](std::string const &event) {
        context.EmitJSEvent(L"RCTDeviceEventEmitter", L"STALLION_NATIVE_EVENT", event);
      });
  }

  void Stallion::onLaunch(std::string) noexcept
  {
    try { ::ReactNativeStallionWindows::StallionCore::Instance().MarkLaunchSuccessful(); } catch (...) {}
  }

  void Stallion::sync() noexcept
  {
    ::ReactNativeStallionWindows::StallionUpdateManager::Instance().SyncAsync();
  }

  void Stallion::downloadStageBundle(::React::JSValueObject &&bundleInfo, ::React::ReactPromise<std::string> &&result) noexcept
  {
    try {
      auto url = bundleInfo.at("url").AsString();
      auto hash = bundleInfo.at("hash").AsString();
      if (url.empty() || hash.empty()) { result.Reject("Invalid or missing download URL or hash"); return; }
      auto shared = std::make_shared<::React::ReactPromise<std::string>>(std::move(result));
      ::ReactNativeStallionWindows::StallionUpdateManager::Instance().DownloadStageAsync(url, hash,
        [shared](std::string value) { shared->Resolve(value); },
        [shared](std::string error) { shared->Reject(error.c_str()); });
    } catch (...) { result.Reject("Invalid stage bundle metadata"); }
  }

  void Stallion::getStallionConfig(::React::ReactPromise<std::string> &&result) noexcept
  {
    try { result.Resolve(::ReactNativeStallionWindows::StallionCore::Instance().ConfigJson()); } catch (std::exception const &e) { result.Reject(e.what()); }
  }

  void Stallion::getStallionMeta(::React::ReactPromise<std::string> &&result) noexcept
  {
    try { result.Resolve(::ReactNativeStallionWindows::StallionCore::Instance().MetaJson()); } catch (std::exception const &e) { result.Reject(e.what()); }
  }

  void Stallion::toggleStallionSwitch(std::string state, ::React::ReactPromise<std::string> &&result) noexcept
  {
    try { ::ReactNativeStallionWindows::StallionCore::Instance().SetSwitchState(state); result.Resolve("Success"); }
    catch (std::exception const &e) { result.Reject(e.what()); }
  }

  void Stallion::updateSdkToken(std::string token, ::React::ReactPromise<std::string> &&result) noexcept
  {
    try { ::ReactNativeStallionWindows::StallionCore::Instance().SetSdkToken(token); result.Resolve("updateSdkToken success"); }
    catch (std::exception const &e) { result.Reject(e.what()); }
  }

  void Stallion::popEvents(::React::ReactPromise<std::string> &&result) noexcept
  {
    try { result.Resolve(::ReactNativeStallionWindows::StallionCore::Instance().PopEvents()); } catch (std::exception const &e) { result.Reject(e.what()); }
  }

  void Stallion::acknowledgeEvents(std::string idsJson, ::React::ReactPromise<std::string> &&result) noexcept
  {
    try {
      JsonArray ids;
      if (!JsonArray::TryParse(winrt::to_hstring(idsJson), ids)) { result.Reject("Invalid event ID JSON"); return; }
      std::vector<std::string> values;
      for (auto const &id : ids) values.push_back(winrt::to_string(id.GetString()));
      ::ReactNativeStallionWindows::StallionCore::Instance().AcknowledgeEvents(values);
      result.Resolve("Events acknowledged successfully.");
    } catch (std::exception const &e) { result.Reject(e.what()); }
  }

  void Stallion::restart() noexcept { ::ReactNativeStallionWindows::StallionWindows::Restart(); }
  std::string Stallion::getActiveReleaseHash() noexcept
  {
    try { return ::ReactNativeStallionWindows::StallionCore::Instance().ActiveReleaseHash(); } catch (...) { return {}; }
  }
  void Stallion::addListener(std::string) noexcept { ++listeners_; }
  void Stallion::removeListeners(double count) noexcept
  {
    auto remove = static_cast<int64_t>(std::max(0.0, count));
    auto current = listeners_.load();
    while (!listeners_.compare_exchange_weak(current, std::max<int64_t>(0, current - remove))) {}
  }
}
