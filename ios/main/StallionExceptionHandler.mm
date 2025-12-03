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
#import <signal.h>
#import <execinfo.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#include <exception>
#include <cxxabi.h>
#include <string>
#include <atomic>

// Forward declarations
void handleException(NSException *exception);
void handleSignal(int signal, siginfo_t *info, void *context);
static void performStallionRollback(NSString *errorString);
static void setupSignalHandlers(void);
void handleCppTerminate(void);

@implementation StallionExceptionHandler

NSUncaughtExceptionHandler *_defaultExceptionHandler;
std::terminate_handler _defaultTerminateHandler;
static std::atomic<bool> exceptionAlertDismissed(false);
static std::atomic<bool> exceptionAlertShowing(false);
static std::atomic<bool> rollbackPerformed(false);
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

        // Store and set C++ terminate handler
        if (!_defaultTerminateHandler) {
            _defaultTerminateHandler = std::get_terminate();
        }
        std::set_terminate(handleCppTerminate);
        
        // Setup signal handlers using sigaction with chaining
        setupSignalHandlers();
        
        // Initialize JavaScript exception handler
        [self initJavaScriptExceptionHandler];
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
    
    if(isAutoRollback) {
      [StallionSlotManager rollbackStage];
    }
    
    [[StallionEventHandler sharedInstance] cacheEvent:StallionObjConstants.exception_stage_event
          eventPayload:@{
              @"meta": errorString,
              StallionObjConstants.release_hash_key: meta.stageNewHash,
              StallionObjConstants.is_auto_rollback_key: isAutoRollback ? @"true" : @"false"
          }];

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

static void setupSignalHandlers(void) {
    struct sigaction action;
    sigemptyset(&action.sa_mask);
    action.sa_flags = SA_SIGINFO | SA_ONSTACK;
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
    void *callstack[128];
    int frames = backtrace(callstack, 128);
    char **symbols = backtrace_symbols(callstack, frames);

    NSMutableString *stackTrace = [NSMutableString stringWithFormat:@"Signal %d was raised.\n", signalVal];
    
    // Add signal info if available
    if (info) {
        [stackTrace appendFormat:@"Signal Code: %d\n", info->si_code];
        if (info->si_addr) {
            [stackTrace appendFormat:@"Fault Address: %p\n", info->si_addr];
        }
    }
    
    [stackTrace appendString:@"Stack trace:\n"];
    for (int i = 0; i < frames; ++i) {
        [stackTrace appendFormat:@"%s\n", symbols[i]];
    }
    free(symbols);

    performStallionRollback(stackTrace);

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

void handleCppTerminate(void) {
    std::exception_ptr ex = std::current_exception();
    NSString *errorString = @"C++ terminate() called";
    
    if (ex) {
        try {
            std::rethrow_exception(ex);
        } catch (const std::exception &e) {
            const char *name = abi::__cxa_demangle(typeid(e).name(), 0, 0, 0);
            errorString = [NSString stringWithFormat:@"C++ Exception: %s - %s", 
                          name ? name : typeid(e).name(), e.what()];
            if (name) free((void*)name);
        } catch (const std::string &s) {
            errorString = [NSString stringWithFormat:@"C++ Exception (string): %s", s.c_str()];
        } catch (const char *s) {
            errorString = [NSString stringWithFormat:@"C++ Exception (char*): %s", s];
        } catch (...) {
            errorString = @"C++ Exception: Unknown type";
        }
    }
    
    // Get stack trace
    void *callstack[128];
    int frames = backtrace(callstack, 128);
    char **symbols = backtrace_symbols(callstack, frames);
    
    NSMutableString *fullError = [NSMutableString stringWithString:errorString];
    [fullError appendString:@"\nStack trace:\n"];
    for (int i = 0; i < frames; ++i) {
        [fullError appendFormat:@"%s\n", symbols[i]];
    }
    free(symbols);
    
    performStallionRollback(fullError);
    
    // Chain to default terminate handler
    if (_defaultTerminateHandler) {
        _defaultTerminateHandler();
    } else {
        abort();
    }
}

