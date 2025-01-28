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
    return @{
        @"switchState": @(self.switchState),
        @"stageSlot": @{
                @"tempHash": self.stageTempHash,
                @"newHash": self.stageNewHash,
                @"currentSlot": @(self.currentStageSlot)
        },
        @"prodSlot": @{
                @"tempHash": self.prodTempHash,
                @"newHash": self.prodNewHash,
                @"stableHash": self.prodStableHash,
                @"currentSlot": @(self.currentProdSlot)
        },
        @"lastRolledBackHash": self.lastRolledBackHash
    };
}

- (NSString *)getActiveReleaseHash {
  if(![self.prodTempHash isEqual:@""]) {
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
    if (!dict || ![dict isKindOfClass:[NSDictionary class]]) {
      return [[StallionMeta alloc] init];
    }
  
    StallionMeta *meta = [[StallionMeta alloc] init];
    meta.switchState = [dict[@"switchState"] integerValue];
    meta.stageTempHash = dict[@"stageSlot"][@"tempHash"];
    meta.stageNewHash = dict[@"stageSlot"][@"newHash"];
    meta.currentStageSlot = [dict[@"stageSlot"][@"currentSlot"] integerValue];
    meta.prodTempHash = dict[@"prodSlot"][@"tempHash"];
    meta.prodNewHash = dict[@"prodSlot"][@"newHash"];
    meta.prodStableHash = dict[@"prodSlot"][@"stableHash"];
    meta.currentProdSlot = [dict[@"prodSlot"][@"currentSlot"] integerValue];
    meta.lastRolledBackHash = dict[@"lastRolledBackHash"];
    return meta;
}

@end

