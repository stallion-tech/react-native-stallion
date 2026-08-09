#pragma once
#include <string>

#ifdef REACTNATIVESTALLIONWINDOWS_EXPORTS
#define RNSTALLION_API __declspec(dllexport)
#else
#define RNSTALLION_API __declspec(dllimport)
#endif

namespace ReactNativeStallionWindows
{
  struct StallionConfig
  {
    bool enabled{true};
    std::string projectId;
    std::string appToken;
    std::string publicSigningKey;
    std::string archivePassword;
    std::string baseUrl;
    std::string appVersion;
    std::string sdkVersion{"2.4.1-windows.1"};
    std::string platformIdentity{"windows"};
  };
}
