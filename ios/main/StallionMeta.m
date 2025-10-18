//
//  StallionMeta.m
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
//

#import "StallionMeta.h"

@implementation StallionMeta

+ (NSInteger)maxSuccessLaunchThreshold {
    return 3;
}

+ (NSTimeInterval)lastRolledBackTTL {
    return 6 * 60 * 60; // 6 hours in seconds
}

- (instancetype)init {
    self = [super init];
    if (self) [self reset];
    return self;
}

- (void)reset {
    self.switchState = SwitchStateProd;
    self.currentProdSlot = SlotStateDefaultSlot;
    self.currentStageSlot = SlotStateDefaultSlot;

    self.stageTempHash = @"";
    self.stageNewHash = @"";
    self.prodTempHash = @"";
    self.prodNewHash = @"";
    self.prodStableHash = @"";
    self.lastRolledBackHash = @"";
     self.lastRolledBackAt = 0.0;
     self.successfulLaunchCount = 0;
     self.lastSuccessfulLaunchHash = @"";
}

- (NSDictionary *)toDictionary {
    @try {
        return @{
            @"switchState": [StallionMetaConstants stringFromSwitchState:self.switchState] ?: @"",
            @"stageSlot": @{
                    @"tempHash": self.stageTempHash ?: @"",
                    @"newHash": self.stageNewHash ?: @"",
                    @"currentSlot": [StallionMetaConstants stringFromSlotState:self.currentStageSlot] ?: @""
            },
            @"prodSlot": @{
                    @"tempHash": self.prodTempHash ?: @"",
                    @"newHash": self.prodNewHash ?: @"",
                    @"stableHash": self.prodStableHash ?: @"",
                    @"currentSlot": [StallionMetaConstants stringFromSlotState:self.currentProdSlot] ?: @""
            },
             @"lastRolledBackHash": self.lastRolledBackHash ?: @"",
             @"lastRolledBackAt": @(self.lastRolledBackAt),
             @"successfulLaunchCount": @(self.successfulLaunchCount),
             @"lastSuccessfulLaunchHash": self.lastSuccessfulLaunchHash ?: @""
        };
    } @catch (NSException *exception) {
        NSLog(@"Error in toDictionary: %@", exception.reason);
        return @{};
    }
}

- (NSString *)getActiveReleaseHash {
    if (![self.prodTempHash isEqual:@""]) {
        return self.prodTempHash;
    }
    switch (self.currentProdSlot) {
        case SlotStateNewSlot:
            return self.prodNewHash;
        case SlotStateStableSlot:
            return self.prodStableHash;
        default:
            return @"";
    }
}

+ (instancetype)fromDictionary:(NSDictionary *)dict {
    @try {
        if (!dict || ![dict isKindOfClass:[NSDictionary class]]) {
            return [[StallionMeta alloc] init];
        }

        StallionMeta *meta = [[StallionMeta alloc] init];

        meta.switchState = [StallionMetaConstants switchStateFromString:dict[@"switchState"] ?: @"prod"];
        NSDictionary *stageSlot = dict[@"stageSlot"];
        NSDictionary *prodSlot = dict[@"prodSlot"];

        meta.stageTempHash = stageSlot[@"tempHash"] ?: @"";
        meta.stageNewHash = stageSlot[@"newHash"] ?: @"";
        meta.currentStageSlot = [StallionMetaConstants slotStateFromString:stageSlot[@"currentSlot"] ?: @"default_slot"];

        meta.prodTempHash = prodSlot[@"tempHash"] ?: @"";
        meta.prodNewHash = prodSlot[@"newHash"] ?: @"";
        meta.prodStableHash = prodSlot[@"stableHash"] ?: @"";
        meta.currentProdSlot = [StallionMetaConstants slotStateFromString:prodSlot[@"currentSlot"] ?: @"default_slot"];

        meta.lastRolledBackHash = dict[@"lastRolledBackHash"] ?: @"";
         meta.lastRolledBackAt = [dict[@"lastRolledBackAt"] doubleValue];
         meta.successfulLaunchCount = [dict[@"successfulLaunchCount"] integerValue];
         meta.lastSuccessfulLaunchHash = dict[@"lastSuccessfulLaunchHash"] ?: @"";

        return meta;
    } @catch (NSException *exception) {
        NSLog(@"Error in fromDictionary: %@", exception.reason);
        return [[StallionMeta alloc] init];
    }
}

 - (NSString *)getHashAtCurrentProdSlot {
     switch (self.currentProdSlot) {
         case SlotStateNewSlot:
             return self.prodNewHash;
         case SlotStateStableSlot:
             return self.prodStableHash;
         default:
             return @"";
     }
 }

 - (NSString *)getLastRolledBackHash {
     [self enforceLastRolledBackExpiry];
     return self.lastRolledBackHash;
 }

- (void)setLastRolledBackHashWithTimestamp:(NSString *)lastRolledBackHash {
    NSString *hashValue = lastRolledBackHash ?: @"";
    self.lastRolledBackHash = hashValue;
    self.lastRolledBackAt = [hashValue isEqualToString:@""] ? 0.0 : [[NSDate date] timeIntervalSince1970];
}

 - (void)enforceLastRolledBackExpiry {
     if (!self.lastRolledBackHash || [self.lastRolledBackHash isEqualToString:@""]) {
         return;
     }
     if (self.lastRolledBackAt <= 0.0) {
         return;
     }
     NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
     if (now - self.lastRolledBackAt >= 6 * 60 * 60) { // 6 hours in seconds
         self.lastRolledBackHash = @"";
         self.lastRolledBackAt = 0.0;
     }
 }

 - (void)markSuccessfulLaunch:(NSString *)releaseHash {
     if (!releaseHash || [releaseHash isEqualToString:@""]) {
         return;
     }
     if (![releaseHash isEqualToString:self.lastSuccessfulLaunchHash]) {
         self.successfulLaunchCount = 0;
         self.lastSuccessfulLaunchHash = releaseHash;
     }
     if (self.successfulLaunchCount < 3) { // MAX_SUCCESS_LAUNCH_THRESHOLD
         self.successfulLaunchCount += 1;
     }
 }

 - (NSInteger)getSuccessfulLaunchCount:(NSString *)releaseHash {
     NSString *currentHash = releaseHash ?: @"";
     if (![currentHash isEqualToString:self.lastSuccessfulLaunchHash]) {
         return 0;
     } else {
         return self.successfulLaunchCount;
     }
 }

@end
