//
//  StallionErrorBoundary.m
//  react-native-stallion
//
//  Created by Jasbir Singh on 24/12/23.
//

#import "StallionErrorBoundary.h"

@implementation StallionErrorBoundary
    
NSUncaughtExceptionHandler *_defaultExceptionHandler;

+ (void)initErrorBoundary {
    if(_defaultExceptionHandler == nil) {
        _defaultExceptionHandler = NSGetUncaughtExceptionHandler();
    }
}

+ (void)toggleExceptionHandler:(BOOL)shouldEnableErrorHandler {
    if(shouldEnableErrorHandler) {
        NSSetUncaughtExceptionHandler(&handleException);
    } else {
        NSSetUncaughtExceptionHandler(_defaultExceptionHandler);
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
