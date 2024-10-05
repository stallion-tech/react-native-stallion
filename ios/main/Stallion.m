#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(Stallion, NSObject)

RCT_EXTERN_METHOD(onLaunch: (NSString *)launchMessage)
RCT_EXTERN_METHOD(sync)
RCT_EXTERN_METHOD(downloadPackage:(NSDictionary *)bundleInfo
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject
                  )
RCT_EXTERN_METHOD(getStorage: (NSString *)storageKey callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(getUniqueId: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(getProjectId: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(setStorage: (NSString *)storageKey value:(NSString *)value)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
