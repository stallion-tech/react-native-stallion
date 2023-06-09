//
//  Stallion.m
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

#import "Stallion.h"

@implementation Stallion
+ (NSURL *)bundleURL
{
    NSURL *defaultBundle = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    return defaultBundle;
}
@end
