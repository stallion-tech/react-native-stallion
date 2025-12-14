//
//  StallionExceptionHandler.mm
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
#import "StallionFileManager.h"
#import <signal.h>
#import <unistd.h>
#import <fcntl.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#include <atomic>

// Forward declarations
void handleException(NSException *exception);
void handleSignal(int signal, siginfo_t *info, void *context);
static void performStallionRollback(NSString *errorString);
static void setupSignalHandlers(void);
static void processNativeCrashMarkerIfPresent(void);

// Async-signal-safe crash marker storage
static char g_marker_path[512];
static char g_mount_marker_path[512];

@implementation StallionExceptionHandler

NSUncaughtExceptionHandler *_defaultExceptionHandler;
static std::atomic<bool> exceptionAlertDismissed(false);
static std::atomic<bool> exceptionAlertShowing(false);
static std::atomic<bool> rollbackPerformed(false);
static std::atomic<bool> hasProcessedNativeCrashMarker(false);
static struct sigaction _previousHandlers[32]; // Store previous handlers for chaining

+ (void)initExceptionHandler {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // Reset rollback flag when initializing exception handler
        [self resetRollbackFlag];
        
        // Store and set Objective-C exception handler
        if (!_defaultExceptionHandler) {
            _defaultExceptionHandler = NSGetUncaughtExceptionHandler();
        }
        NSSetUncaughtExceptionHandler(&handleException);
        
        // Setup signal handlers using sigaction with chaining
        setupSignalHandlers();
        
        // Initialize JavaScript exception handler
        [self initJavaScriptExceptionHandler];
        
        // Process any crash marker from previous session
        processNativeCrashMarkerIfPresent();
    });
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
    rollbackPerformed.store(false);
}

@end

#pragma mark - Shared Rollback Logic

static void performStallionRollback(NSString *errorString) {
    
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *meta = stateManager.stallionMeta;
    BOOL isAutoRollback = !stateManager.isMounted;
  
  
  // Only prevent multiple executions for auto rollback cases
  // Launch crashes (when mounted) can continue to be registered
  if (isAutoRollback) {
    // Use compare-and-swap to atomically check and set the flag
    bool expected = false;
    if (!rollbackPerformed.compare_exchange_strong(expected, true)) {
      // Flag was already true, skip duplicate rollback
      return;
    }
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
    NSString *currentStageHash = meta.stageNewHash ?: @"";
    
    // Emit exception event before rollback (consistent with PROD and Android)
    [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_stage_event
          eventPayload:@{
              @"meta": errorString,
              StallionObjConstants.release_hash_key: currentStageHash,
              StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
          }];
    
    if(isAutoRollback) {
      [StallionSlotManager rollbackStage];
    }

      // Check if alert is already showing (atomic check to prevent duplicates)
      bool expectedShowing = false;
      if (exceptionAlertShowing.compare_exchange_strong(expectedShowing, true)) {
        // We successfully claimed the right to show the alert
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Stallion Exception Handler"
           message:[NSString stringWithFormat:@"%@\n%@",
                    @"A crash occurred in the app. Build was rolled back. Check crash report below. Continue crash to invoke other exception handlers. \n \n",
                    errorString]
          preferredStyle:UIAlertControllerStyleAlert];

        [alert addAction:[UIAlertAction actionWithTitle:@"Continue Crash"
                                                  style:UIAlertActionStyleDefault
                                                handler:^(UIAlertAction *action) {
                                                    // Set flag to true only when button is pressed
                                                    exceptionAlertDismissed.store(true);
                                                }]];

        UIApplication *app = [UIApplication sharedApplication];
        UIViewController *rootViewController = app.delegate.window.rootViewController;

        dispatch_async(dispatch_get_main_queue(), ^{
            [rootViewController presentViewController:alert animated:YES completion:nil];
        });

        // Wait for user to press the button (exceptionAlertDismissed becomes true)
        while (!exceptionAlertDismissed.load()) {
            [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
        }
      }
    }
}

#pragma mark - Signal Handler Setup

// Async-signal-safe function to check if mount marker exists
static int is_mounted_safe(void) {
    int fd = open(g_mount_marker_path, O_RDONLY);
    if (fd >= 0) {
        close(fd);
        return 1; // Mounted
    }
    return 0; // Not mounted
}

// Async-signal-safe JSON writing (minimal JSON for crash marker)
static void write_crash_marker_json_safe(int signal, int mounted) {
    int fd = open(g_marker_path, O_CREAT | O_WRONLY | O_TRUNC, 0600);
    if (fd >= 0) {
        // Write JSON: {"signal":X,"isAutoRollback":true/false,"crashLog":"signal=X\n"}
        // isAutoRollback = !mounted (auto rollback if not mounted)
        int autoRollback = !mounted;
        char json[512];
        int len = snprintf(json, sizeof(json),
            "{\"signal\":%d,\"isAutoRollback\":%s,\"crashLog\":\"signal=%d\\n\"}",
            signal, autoRollback ? "true" : "false", signal);
        if (len > 0 && len < (int)sizeof(json)) {
            (void)write(fd, json, len);
        }
        close(fd);
    }
}

static void setupSignalHandlers(void) {
    // Initialize marker paths from StallionStateManager
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    NSString *filesDir = stateManager.stallionConfig.filesDirectory;
    if (filesDir) {
        const char *path = [filesDir UTF8String];
        snprintf(g_marker_path, sizeof(g_marker_path), "%s/%s", path, "stallion_crash.marker");
        snprintf(g_mount_marker_path, sizeof(g_mount_marker_path), "%s/%s", path, "stallion_mount.marker");
    }
    
    struct sigaction action;
    sigemptyset(&action.sa_mask);
    action.sa_flags = SA_SIGINFO;
    action.sa_sigaction = handleSignal;
    
    // List of signals to catch - comprehensive coverage
    int signals[] = {
        SIGABRT,   // Abort signal
        SIGILL,    // Illegal instruction
        SIGSEGV,   // Segmentation violation
        SIGFPE,    // Floating point exception
        SIGBUS,    // Bus error
        SIGTRAP,   // Trace/breakpoint trap
        SIGPIPE,   // Broken pipe
        SIGSYS,    // Bad system call
    };
    
    int signalCount = sizeof(signals) / sizeof(signals[0]);
    
    for (int i = 0; i < signalCount; i++) {
        int sig = signals[i];
        // Store previous handler before installing ours (for chaining)
        sigaction(sig, NULL, &_previousHandlers[sig]);
        // Now install our handler
        sigaction(sig, &action, NULL);
    }
}

void handleException(NSException *exception) {
    NSString *readableError = [exception reason] ?: @"Unknown exception";
    NSString *name = [exception name] ?: @"Unknown";
    NSString *callStack = [[exception callStackSymbols] componentsJoinedByString:@"\n"];
    NSString *fullError = [NSString stringWithFormat:@"Exception: %@\nReason: %@\nStack:\n%@", name, readableError, callStack];
    
    performStallionRollback(fullError);

    // Chain to default exception handler if available
    if (_defaultExceptionHandler) {
        _defaultExceptionHandler(exception);
    }
}

void handleSignal(int signalVal, siginfo_t *info, void *context) {

    if (!rollbackPerformed.load()) {
        // Async-signal-safe operations only
        // Read mount state at crash time (async-signal-safe)
        int mounted = is_mounted_safe();
        // Write JSON marker with crash info and autoRollback flag
        write_crash_marker_json_safe(signalVal, mounted);
    }
    
    // Chain to previous handler if it exists and is valid (bubble up)
    if (signalVal >= 0 && signalVal < 32) {
        struct sigaction *prev = &_previousHandlers[signalVal];
        if (prev->sa_handler != SIG_DFL && prev->sa_handler != SIG_IGN && prev->sa_handler != NULL) {
            // Prevent infinite loop - don't call ourselves
            if (prev->sa_sigaction != handleSignal) {
                if (prev->sa_flags & SA_SIGINFO) {
                    prev->sa_sigaction(signalVal, info, context);
                } else if (prev->sa_handler != SIG_DFL && prev->sa_handler != SIG_IGN) {
                    prev->sa_handler(signalVal);
                }
            }
        }
    }
    
    // Restore default and raise to proceed with crash
    signal(signalVal, SIG_DFL);
    raise(signalVal);
}

#pragma mark - Crash Marker Processing

static void processNativeCrashMarkerIfPresent(void) {
    @try {
        if (hasProcessedNativeCrashMarker.load()) {
            return;
        }
        
        StallionStateManager *stateManager = [StallionStateManager sharedInstance];
        NSString *filesDir = stateManager.stallionConfig.filesDirectory;
        NSString *markerPath = [NSString stringWithFormat:@"%@/stallion_crash.marker", filesDir];
        
        NSFileManager *fileManager = [NSFileManager defaultManager];
        if ([fileManager fileExistsAtPath:markerPath]) {
            NSError *error = nil;
            NSString *jsonContent = [NSString stringWithContentsOfFile:markerPath
                                                              encoding:NSUTF8StringEncoding
                                                                 error:&error];
            
            if (jsonContent && !error) {
                NSString *stackTraceString = @"";
                BOOL isAutoRollback = NO;
                
                @try {
                    // Parse JSON from previous crash
                    NSData *jsonData = [jsonContent dataUsingEncoding:NSUTF8StringEncoding];
                    NSDictionary *crashMarker = [NSJSONSerialization JSONObjectWithData:jsonData
                                                                                options:0
                                                                                  error:&error];
                    if (crashMarker && !error) {
                        // Extract crash log and autoRollback flag from marker
                        stackTraceString = crashMarker[@"crashLog"] ?: @"";
                        // Use the autoRollback flag that was determined at crash time (previous session)
                        isAutoRollback = [crashMarker[@"isAutoRollback"] boolValue];
                    }
                } @catch (NSException *e) {
                    // Fallback for old format (non-JSON)
                    stackTraceString = jsonContent;
                    // Default to true for old format (conservative approach)
                    isAutoRollback = YES;
                }
                
                if (stackTraceString.length > 900) {
                    stackTraceString = [stackTraceString substringToIndex:900];
                }
                
                StallionMeta *meta = stateManager.stallionMeta;
                SwitchState switchState = meta.switchState;
                
                if (switchState == SwitchStateProd) {
                    NSString *currentHash = [meta getActiveReleaseHash] ?: @"";
                    // Use isAutoRollback from previous crash, not current session state
                    @try {
                        [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_prod_event
                                                              eventPayload:@{
                                                                  @"meta": stackTraceString,
                                                                  StallionObjConstants.release_hash_key: currentHash,
                                                                  StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
                                                              }];
                    } @catch (NSException *e) { }
                    
                    if (isAutoRollback) {
                        // Only prevent multiple executions for auto rollback cases
                        bool expected = false;
                        if (rollbackPerformed.compare_exchange_strong(expected, true)) {
                            @try {
                                [StallionSlotManager rollbackProdWithAutoRollback:YES errorString:stackTraceString];
                            } @catch (NSException *e) { }
                        }
                    }
                } else if (switchState == SwitchStateStage) {
                    NSString *currentStageHash = meta.stageNewHash ?: @"";
                    // Use isAutoRollback from previous crash, not current session state
                    @try {
                        [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_stage_event
                                                              eventPayload:@{
                                                                  @"meta": stackTraceString,
                                                                  StallionObjConstants.release_hash_key: currentStageHash,
                                                                  StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
                                                              }];
                    } @catch (NSException *e) { }
                    
                    if (isAutoRollback) {
                        // Only prevent multiple executions for auto rollback cases
                        bool expected = false;
                        if (rollbackPerformed.compare_exchange_strong(expected, true)) {
                            @try {
                                [StallionSlotManager rollbackStage];
                            } @catch (NSException *e) { }
                        }
                    }
                }
                
                // Delete marker
                [StallionFileManager deleteFileOrFolderSilently:markerPath];
                hasProcessedNativeCrashMarker.store(true);
            }
        }
    } @catch (NSException *e) { }
}

