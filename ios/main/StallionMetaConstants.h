//
//  StallionMetaConstants.h
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
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

@end
