#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Stallion, NSObject)

RCT_EXTERN_METHOD(noopMethod)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
