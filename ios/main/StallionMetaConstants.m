//
//  StallionMetaConstants.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import "StallionMetaConstants.h"

@implementation StallionMetaConstants

+ (SwitchState)switchStateFromString:(NSString *)value {
    if ([value.lowercaseString isEqualToString:@"prod"]) return SwitchStateProd;
    if ([value.lowercaseString isEqualToString:@"stage"]) return SwitchStateStage;
    @throw [NSException exceptionWithName:@"InvalidSwitchStateException" reason:@"Invalid SwitchState" userInfo:nil];
}

+ (SlotStates)slotStateFromString:(NSString *)value {
    if ([value.lowercaseString isEqualToString:@"new_slot"]) return SlotStateNewSlot;
    if ([value.lowercaseString isEqualToString:@"stable_slot"]) return SlotStateStableSlot;
    if ([value.lowercaseString isEqualToString:@"default_slot"]) return SlotStateDefaultSlot;
    @throw [NSException exceptionWithName:@"InvalidSlotStateException" reason:@"Invalid SlotState" userInfo:nil];
}

@end
