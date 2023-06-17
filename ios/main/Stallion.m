#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(Stallion, NSObject)

RCT_EXTERN_METHOD(downloadPackage:(NSDictionary *)bundleInfo
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject
                  )

RCT_EXTERN_METHOD(getStallionMeta: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(getAuthTokens: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(toggleStallionSwitch: (BOOL *)isOn)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
