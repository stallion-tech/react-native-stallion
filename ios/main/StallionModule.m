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
    NSSetUncaughtExceptionHandler(&handleException);
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

BOOL exceptionAlertDismissed = FALSE;
void handleException(NSException *exception)
{
    NSString *switchState = [[NSUserDefaults standardUserDefaults]
        stringForKey:@"switchState"];
    if([switchState isEqual:@"STALLION_ON"]) {
        [[NSUserDefaults standardUserDefaults] setObject:@"DEFAULT" forKey:@"switchState"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        NSString * readeableError = [exception reason];
        UIAlertController* alert = [UIAlertController
                                    alertControllerWithTitle:@"Stallion Error Boundary"
                                    message:[NSString stringWithFormat:@"%@\n%@",
                                             @"A crash occurred in the app. We have switched Stallion off. Check crash report below. Continue crash to invoke other exception handlers. \n \n",
                                             readeableError]
                                    preferredStyle:UIAlertControllerStyleAlert];
        
        [alert addAction:[UIAlertAction actionWithTitle:@"Continue Crash"
                                                  style:UIAlertActionStyleDefault
                                                handler:^(UIAlertAction *action) {
                                                    exceptionAlertDismissed = TRUE;
                                                }]];
        
        UIApplication* app = [UIApplication sharedApplication];
        UIViewController * rootViewController = app.delegate.window.rootViewController;
        dispatch_async(dispatch_get_main_queue(), ^{
            [rootViewController presentViewController:alert animated:YES completion:nil];
        });
        while (exceptionAlertDismissed == FALSE)
        {
            [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
        }
    }
}

@end
