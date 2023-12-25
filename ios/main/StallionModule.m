//
//  StallionModule.m
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

#import "StallionModule.h"

@implementation StallionModule
+ (NSURL *)getBundleURL {
    return [self getBundleURL:nil];
}
+ (NSURL *)getBundleURL:(NSURL *)defaultBundleURL {
    NSURL *defaultRNBundlePath = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    NSString *documentDirectoryPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
    NSString *bundleFilePath = [documentDirectoryPath stringByAppendingPathComponent:@"StallionPackage/build/main.jsbundle"];
    NSURL *targetBundleUrl = [NSURL URLWithString:bundleFilePath];

    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:[targetBundleUrl path]]) {
        if(defaultBundleURL != nil) return defaultBundleURL;
        return defaultRNBundlePath;
    } else {
        NSString *switchState = [[NSUserDefaults standardUserDefaults]
            stringForKey:@"switchState"];
        if([switchState isEqual:@"STALLION_ON"]) {
            return targetBundleUrl;
        } else {
            if(defaultBundleURL != nil) return defaultBundleURL;
            return defaultRNBundlePath;
        }
    }
}

@end
