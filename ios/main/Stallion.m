#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(Stallion, NSObject)

RCT_EXTERN_METHOD(onLaunch: (NSString *)launchMessage)

RCT_EXTERN_METHOD(sync)

RCT_EXTERN_METHOD(downloadStageBundle: (NSDictionary *)bundleInfo
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getStallionConfig: (RCTPromiseResolveBlock)promise
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(getStallionMeta: (RCTPromiseResolveBlock)promise
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(toggleStallionSwitch: (NSString *)switchState
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(updateSdkToken: (NSString *)newSdkToken
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(popEvents: (RCTPromiseResolveBlock)promise
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(acknowledgeEvents: (NSString *)eventIdsJson
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(restart)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
