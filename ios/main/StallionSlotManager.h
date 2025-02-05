//
//  StallionSlotManager.h
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 29/01/25.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface StallionSlotManager : NSObject

+ (void)rollbackProdWithAutoRollback:(BOOL)isAutoRollback errorString:(NSString *)errorString;
+ (void)fallbackProd;
+ (void)rollbackStage;
+ (void)stabilizeProd;

@end

NS_ASSUME_NONNULL_END
