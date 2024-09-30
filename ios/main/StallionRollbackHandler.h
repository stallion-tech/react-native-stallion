//
//  StallionRollbackHandler.h
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 27/09/24.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface StallionRollbackHandler : NSObject
+ (void)rollbackProd;
+ (void)rollbackStage;
+ (void)fallbackProd;
+ (void)promoteTempProd;
+ (void)promoteTempStage;
+ (void)stabilizeRelease;
@end

NS_ASSUME_NONNULL_END
