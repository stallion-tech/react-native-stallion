//
//  StallionEventHandler.h
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@class StallionStateManager;

NS_ASSUME_NONNULL_BEGIN

@interface StallionEventHandler : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)sharedInstance;
+ (void)initWithStateManager:(StallionStateManager *)stateManager;

- (void)sendEventWithoutCaching:(NSString *)eventName eventPayload:(NSDictionary *)eventPayload;
- (void)sendEvent:(NSString *)eventName eventPayload:(NSDictionary *)eventPayload;
- (NSString *)popEvents;
- (void)acknowledgeEvents:(NSArray<NSString *> *)eventIds;

@end

NS_ASSUME_NONNULL_END
