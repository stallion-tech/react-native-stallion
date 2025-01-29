//
//  StallionMeta.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import "StallionMeta.h"

@implementation StallionMeta

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
            @"lastRolledBackHash": self.lastRolledBackHash ?: @""
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

        return meta;
    } @catch (NSException *exception) {
        NSLog(@"Error in fromDictionary: %@", exception.reason);
        return [[StallionMeta alloc] init];
    }
}

@end
