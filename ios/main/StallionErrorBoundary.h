//
//  StallionErrorBoundary.h
//  react-native-stallion
//
//  Created by Jasbir Singh on 24/12/23.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface StallionErrorBoundary : NSObject
+ (void)initErrorBoundary;
+ (void)toggleExceptionHandler:(BOOL)shouldEnableErrorHandler;
@end

NS_ASSUME_NONNULL_END
