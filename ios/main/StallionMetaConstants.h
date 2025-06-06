//
//  StallionMetaConstants.h
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
//

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, SwitchState) {
    SwitchStateProd,
    SwitchStateStage
};

typedef NS_ENUM(NSInteger, SlotStates) {
    SlotStateNewSlot,
    SlotStateStableSlot,
    SlotStateDefaultSlot
};

@interface StallionMetaConstants : NSObject

+ (SwitchState)switchStateFromString:(NSString *)value;
+ (SlotStates)slotStateFromString:(NSString *)value;
+ (NSString *)stringFromSwitchState:(SwitchState)state;
+ (NSString *)stringFromSlotState:(SlotStates)state;

@end
