//
//  StallionExceptionHandler.m
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 29/01/25.
//

#import "StallionExceptionHandler.h"
#import "StallionStateManager.h"
#import "StallionEventHandler.h"
#import "StallionSlotManager.h"
#import "StallionMeta.h"
#import "StallionMetaConstants.h"
#import "StallionObjConstants.h"

@implementation StallionExceptionHandler

NSUncaughtExceptionHandler *_defaultExceptionHandler;

+ (void)initExceptionHandler {
    if (!_defaultExceptionHandler) {
        _defaultExceptionHandler = NSGetUncaughtExceptionHandler();
    }
    NSSetUncaughtExceptionHandler(&handleException);
}

BOOL exceptionAlertDismissed = FALSE;

void handleException(NSException *exception) {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *meta = stateManager.stallionMeta;
    BOOL isAutoRollback = !stateManager.isMounted;

    NSString *readableError = [exception reason];
  
  if (readableError.length > 900) {
      readableError = [readableError substringToIndex:900];
  }

  if (meta.switchState == SwitchStateProd) {
    NSString *currentHash = [meta getActiveReleaseHash] ?: @"";

    [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_prod_event
          eventPayload:@{
              @"meta": readableError,
              StallionObjConstants.release_hash_key: currentHash,
              StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
          }];
        if (isAutoRollback) {
            [StallionSlotManager rollbackProdWithAutoRollback:YES errorString:readableError];
        }

  } else if (meta.switchState == SwitchStateStage) {
        [StallionSlotManager rollbackStage];
    
    [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_stage_event
          eventPayload:@{
              @"meta": readableError,
              StallionObjConstants.release_hash_key: meta.stageNewHash,
              StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
          }];

        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Stallion Exception Handler"
           message:[NSString stringWithFormat:@"%@\n%@",
                    @"A crash occurred in the app. Build was rolled back. Check crash report below. Continue crash to invoke other exception handlers. \n \n",
                    readableError]
          preferredStyle:UIAlertControllerStyleAlert];

        [alert addAction:[UIAlertAction actionWithTitle:@"Continue Crash"
                                                  style:UIAlertActionStyleDefault
                                                handler:^(UIAlertAction *action) {
                                                    exceptionAlertDismissed = TRUE;
                                                }]];

        UIApplication *app = [UIApplication sharedApplication];
        UIViewController *rootViewController = app.delegate.window.rootViewController;

        dispatch_async(dispatch_get_main_queue(), ^{
            [rootViewController presentViewController:alert animated:YES completion:nil];
        });

        while (exceptionAlertDismissed == FALSE) {
            [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
        }
    }

    // Call default exception handler if available
    if (_defaultExceptionHandler) {
        _defaultExceptionHandler(exception);
    }
}

@end

