#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "StallionStateManager.h"
#import "StallionMeta.h"

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

// Forward declare the class (implemented in Swift)
@class Stallion;

@interface Stallion (Sync)
@end

@implementation Stallion (Sync)

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getActiveReleaseHash)
{
  StallionStateManager *stateManager = [StallionStateManager sharedInstance];
  if (stateManager && stateManager.stallionMeta) {
    NSString *hash = [stateManager.stallionMeta getActiveReleaseHash];
    return hash ? hash : @"";
  }
  return @"";
}

@end
