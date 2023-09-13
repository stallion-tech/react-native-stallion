//
//  Stallion.m
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

#import "StallionModule.h"

@implementation StallionModule
+ (NSURL *)getBundleURL
{
    return [self getBundleURL:nil];
}
+ (NSURL *)getBundleURL:(NSURL *)defaultBundleURL {
    if(defaultBundleURL != nil) return defaultBundleURL;
    NSURL *defaultRNBundlePath = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    return defaultRNBundlePath;
}
@end
