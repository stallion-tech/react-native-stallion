//
//  StallionEventHandler.h
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridge.h>

@class StallionStateManager;

NS_ASSUME_NONNULL_BEGIN

@interface StallionEventHandler : NSObject
+ (instancetype)sharedInstance;
- (void)cacheEvent:(NSString *)eventName eventPayload:(NSDictionary *)eventPayload;
- (NSString *)popEvents;
- (void)acknowledgeEvents:(NSArray<NSString *> *)eventIds;

@end

NS_ASSUME_NONNULL_END
