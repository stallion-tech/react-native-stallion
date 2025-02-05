//
//  StallionMeta.h
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
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

- (void)reset;
- (NSDictionary *)toDictionary;
- (NSString *)getActiveReleaseHash;
+ (instancetype)fromDictionary:(NSDictionary *)dict;

@end
