//
//  StallionRollbackHandler.h
//  react-native-stallion
//
//  Created by Thor963  on 27/09/24.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface StallionRollbackHandler : NSObject
+ (void)rollbackProd:(BOOL)isAutoRollback;
+ (void)sendRollbackEvent:(BOOL)isAutoRollback releaseHash:(NSString *)releaseHash;
+ (void)rollbackStage;
+ (void)fallbackProd;
+ (void)promoteTempProd;
+ (void)promoteTempStage;
+ (void)stabilizeRelease;
@end

NS_ASSUME_NONNULL_END
