//
//  StallionMeta.h
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
//

#import <Foundation/Foundation.h>
#import "StallionMetaConstants.h"

@interface StallionMeta : NSObject

@property (nonatomic, assign) SwitchState switchState;
@property (nonatomic, assign) SlotStates currentProdSlot;
@property (nonatomic, assign) SlotStates currentStageSlot;

@property (nonatomic, copy) NSString *stageTempHash;
@property (nonatomic, copy) NSString *stageNewHash;
@property (nonatomic, copy) NSString *prodTempHash;
@property (nonatomic, copy) NSString *prodNewHash;
@property (nonatomic, copy) NSString *prodStableHash;
@property (nonatomic, copy) NSString *lastRolledBackHash;
@property (nonatomic, assign) NSTimeInterval lastRolledBackAt;
@property (nonatomic, assign) NSInteger successfulLaunchCount;
@property (nonatomic, copy) NSString *lastSuccessfulLaunchHash;

+ (NSInteger)maxSuccessLaunchThreshold;
+ (NSTimeInterval)lastRolledBackTTL;

- (void)reset;
- (NSDictionary *)toDictionary;
- (NSString *)getHashAtCurrentProdSlot;
- (NSString *)getActiveReleaseHash;
- (NSString *)getLastRolledBackHash;
- (void)setLastRolledBackHashWithTimestamp:(NSString *)lastRolledBackHash;
- (void)markSuccessfulLaunch:(NSString *)releaseHash;
- (NSInteger)getSuccessfulLaunchCount:(NSString *)releaseHash;
- (NSString *)getCurrentProdSlotPath;
+ (instancetype)fromDictionary:(NSDictionary *)dict;

@end
