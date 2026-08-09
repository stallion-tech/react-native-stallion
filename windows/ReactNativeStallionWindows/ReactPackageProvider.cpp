#include "pch.h"
#include "ReactPackageProvider.h"
#include "ReactPackageProvider.g.cpp"
#include <ModuleRegistration.h>

using namespace winrt::Microsoft::ReactNative;

namespace winrt::ReactNativeStallionWindows::implementation
{
  void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
  {
    AddAttributedModules(packageBuilder, true);
  }
}
