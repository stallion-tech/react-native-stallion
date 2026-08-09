#pragma once
#include "ReactPackageProvider.g.h"

namespace winrt::ReactNativeStallionWindows::implementation
{
  struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider>
  {
    void CreatePackage(Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept;
  };
}

namespace winrt::ReactNativeStallionWindows::factory_implementation
{
  struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider, implementation::ReactPackageProvider> {};
}
