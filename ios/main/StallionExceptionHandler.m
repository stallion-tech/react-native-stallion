//
//  StallionExceptionHandler.m
//  react-native-stallion
//
//  Created by Thor963 on 29/01/25.
//

#import "StallionExceptionHandler.h"
#import "StallionStateManager.h"
#import "StallionEventHandler.h"
#import "StallionSlotManager.h"
#import "StallionMeta.h"
#import "StallionMetaConstants.h"
#import "StallionObjConstants.h"
#import <signal.h>
#import <execinfo.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>

// Forward declarations
void handleException(NSException *exception);
void handleSignal(int signal);
static void performStallionRollback(NSString *errorString);

@implementation StallionExceptionHandler

NSUncaughtExceptionHandler *_defaultExceptionHandler;
BOOL exceptionAlertDismissed = FALSE;
static BOOL rollbackPerformed = FALSE;

+ (void)initExceptionHandler {
    // Reset rollback flag when initializing exception handler
    [self resetRollbackFlag];
    
    if (!_defaultExceptionHandler) {
        _defaultExceptionHandler = NSGetUncaughtExceptionHandler();
    }
    NSSetUncaughtExceptionHandler(&handleException);

    signal(SIGABRT, handleSignal);
    signal(SIGILL, handleSignal);
    signal(SIGSEGV, handleSignal);
    signal(SIGFPE, handleSignal);
    signal(SIGBUS, handleSignal);
    
    // Initialize JavaScript exception handler
    [self initJavaScriptExceptionHandler];
}

+ (void)initJavaScriptExceptionHandler {
    // Handle fatal JavaScript errors that cause app crashes
    RCTSetLogFunction(^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        // Rollback only for fatal errors that crash the app
        if (level >= RCTLogLevelFatal) {
            NSString *errorString = [NSString stringWithFormat:@"Fatal JS Error in %@:%@ - %@", fileName, lineNumber, message];
            performStallionRollback(errorString);
        }
    });
}

+ (void)resetRollbackFlag {
    rollbackPerformed = FALSE;
}

@end

#pragma mark - Shared Rollback Logic

static void performStallionRollback(NSString *errorString) {
    
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *meta = stateManager.stallionMeta;
    BOOL isAutoRollback = !stateManager.isMounted;
  
  
  // Only prevent multiple executions for auto rollback cases
  // Launch crashes (when mounted) can continue to be registered
  if (rollbackPerformed && isAutoRollback) {
      NSLog(@"Auto rollback already performed, skipping duplicate rollback attempt");
      return;
  }
  
  // Set rollback flag only for auto rollback cases
  if (isAutoRollback) {
    rollbackPerformed = TRUE;
  }
  
  if (errorString.length > 900) {
    errorString = [errorString substringToIndex:900];
  }

  if (meta.switchState == SwitchStateProd) {
    NSString *currentHash = [meta getActiveReleaseHash] ?: @"";

    [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_prod_event
          eventPayload:@{
              @"meta": errorString,
              StallionObjConstants.release_hash_key: currentHash,
              StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
          }];
        if (isAutoRollback) {
            [StallionSlotManager rollbackProdWithAutoRollback:YES errorString:errorString];
        }

  } else if (meta.switchState == SwitchStateStage) {
    
    if(isAutoRollback) {
      [StallionSlotManager rollbackStage];
    }
    
    [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_stage_event
          eventPayload:@{
              @"meta": errorString,
              StallionObjConstants.release_hash_key: meta.stageNewHash,
              StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
          }];

      if(!exceptionAlertDismissed) {
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Stallion Exception Handler"
           message:[NSString stringWithFormat:@"%@\n%@",
                    @"A crash occurred in the app. Build was rolled back. Check crash report below. Continue crash to invoke other exception handlers. \n \n",
                    errorString]
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
    }
}

void handleException(NSException *exception) {
    NSString *readableError = [exception reason] ?: @"Unknown exception";
    performStallionRollback(readableError);

// Call default exception handler if available
    if (_defaultExceptionHandler) {
        _defaultExceptionHandler(exception);
    }
}

void handleSignal(int signalVal) {
    void *callstack[128];
    int frames = backtrace(callstack, 128);
    char **symbols = backtrace_symbols(callstack, frames);

    NSMutableString *stackTrace = [NSMutableString stringWithFormat:@"Signal %d was raised.\n", signalVal];
    for (int i = 0; i < frames; ++i) {
        [stackTrace appendFormat:@"%s\n", symbols[i]];
    }
    free(symbols);

    performStallionRollback(stackTrace);

    // Restore default and raise to proceed with crash
    signal(signalVal, SIG_DFL);
    raise(signalVal);
}
