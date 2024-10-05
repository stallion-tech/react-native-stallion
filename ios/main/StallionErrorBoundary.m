//
//  StallionErrorBoundary.m
//  react-native-stallion
//
//  Created by Jasbir Singh on 24/12/23.
//

#import "StallionErrorBoundary.h"
#import "StallionEventManager.h"
#import "StallionObjConstants.h"
#import "StallionObjUtil.h"
#import "StallionRollbackHandler.h"

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
                             stringForKey:[StallionObjConstants switch_state_identifier]];
  
    NSString * readeableError = [exception reason];
    if([switchState isEqual:[StallionObjConstants switch_state_prod]]) {
      NSString *currentProdSlot = [[NSUserDefaults standardUserDefaults] stringForKey:StallionObjConstants.current_prod_slot_key];
      if(![currentProdSlot isEqual:StallionObjConstants.default_folder_slot]) {
        [[StallionEventManager sharedInstance] queueRNEvent:[StallionObjConstants exception_prod_event] withData:@{@"error" : readeableError}];
      }
      if(![StallionObjUtil isMounted]) {
        [StallionRollbackHandler rollbackProd:true];
      }
    }  else if([switchState isEqual:[StallionObjConstants switch_state_stage]]) {
      [StallionRollbackHandler rollbackStage];
      UIAlertController* alert = [UIAlertController
                                  alertControllerWithTitle:@"Stallion Error Boundary"
                                  message:[NSString stringWithFormat:@"%@\n%@",
                                           @"A crash occurred in the app. Build was rolled back. Check crash report below. Continue crash to invoke other exception handlers. \n \n",
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
