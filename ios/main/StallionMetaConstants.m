//
//  StallionMetaConstants.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import "StallionMetaConstants.h"

@implementation StallionMetaConstants

+ (SwitchState)switchStateFromString:(NSString *)value {
    if ([value isEqualToString:@"PROD"]) return SwitchStateProd;
    if ([value isEqualToString:@"STAGE"]) return SwitchStateStage;
    @throw [NSException exceptionWithName:@"InvalidSwitchStateException" reason:@"Invalid SwitchState" userInfo:nil];
}

+ (SlotStates)slotStateFromString:(NSString *)value {
    if ([value isEqualToString:@"NEW_SLOT"]) return SlotStateNewSlot;
    if ([value isEqualToString:@"STABLE_SLOT"]) return SlotStateStableSlot;
    if ([value isEqualToString:@"DEFAULT_SLOT"]) return SlotStateDefaultSlot;
    return SlotStateDefaultSlot;
}

+ (NSString *)stringFromSwitchState:(SwitchState)state {
    switch (state) {
        case SwitchStateProd: return @"PROD";
        case SwitchStateStage: return @"STAGE";
        default: return @"unknown";
    }
}

+ (NSString *)stringFromSlotState:(SlotStates)state {
    switch (state) {
        case SlotStateNewSlot: return @"NEW_SLOT";
        case SlotStateStableSlot: return @"STABLE_SLOT";
        case SlotStateDefaultSlot: return @"DEFAULT_SLOT";
        default: return @"unknown";
    }
}

@end
