//
//  StallionEventHandler.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "StallionEventHandler.h"
#import "StallionStateManager.h"

static NSString *const STALLION_NATIVE_EVENT_NAME = @"STALLION_NATIVE_EVENT";
static NSString *const EVENTS_KEY = @"stored_events";
static NSInteger const MAX_BATCH_COUNT_SIZE = 5;

@interface StallionEventHandler ()

@property (nonatomic, strong) StallionStateManager *stallionStateManager;

@end

@implementation StallionEventHandler

static StallionEventHandler *_instance = nil;

+ (instancetype)sharedInstance {
    if (!_instance) {
        @throw [NSException exceptionWithName:@"UninitializedException"
                                       reason:@"Call initWithStateManager: first"
                                     userInfo:nil];
    }
    return _instance;
}

+ (void)initWithStateManager:(StallionStateManager *)stateManager {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[StallionEventHandler alloc] initWithStateManager:stateManager];
    });
}

- (instancetype)initWithStateManager:(StallionStateManager *)stateManager {
    self = [super init];
    if (self) {
        self.stallionStateManager = stateManager;
    }
    return self;
}

// Removed the setEmitter method, as it's no longer required.

- (void)sendEventWithoutCaching:(NSString *)eventName eventPayload:(NSDictionary *)eventPayload {
    NSMutableDictionary *mutablePayload = [eventPayload mutableCopy];
    mutablePayload[@"type"] = eventName;

    // Emit the event to React Native using self.bridge
    if (self.bridge) {
        [self sendEventWithName:STALLION_NATIVE_EVENT_NAME body:mutablePayload];
    } else {
        NSLog(@"Bridge is not set. Event not sent.");
    }
}

- (void)sendEvent:(NSString *)eventName eventPayload:(NSDictionary *)eventPayload {
    NSMutableDictionary *mutablePayload = [eventPayload mutableCopy];
    NSString *uniqueId = [[NSUUID UUID] UUIDString];
    mutablePayload[@"eventId"] = uniqueId;
    mutablePayload[@"eventTimestamp"] = @([[NSDate date] timeIntervalSince1970] * 1000);
    mutablePayload[@"type"] = eventName;

    // Emit the event to React Native using self.bridge
    if (self.bridge) {
        [self sendEventWithName:STALLION_NATIVE_EVENT_NAME body:mutablePayload];
    } else {
        NSLog(@"Bridge is not set. Event not sent.");
    }

    // Store the event locally
    [self storeEventLocally:uniqueId eventPayload:mutablePayload];
}

- (void)storeEventLocally:(NSString *)uniqueId eventPayload:(NSDictionary *)eventPayload {
    @try {
        NSString *eventsString = [self.stallionStateManager getStringForKey:EVENTS_KEY defaultValue:@"{}"];
        NSMutableDictionary *eventsObject = [NSJSONSerialization JSONObjectWithData:[
          eventsString dataUsingEncoding:NSUTF8StringEncoding]
          options:NSJSONReadingMutableContainers
          error:nil
        ];
        if (!eventsObject) {
            eventsObject = [NSMutableDictionary dictionary];
        }

        eventsObject[uniqueId] = eventPayload;
        NSData *updatedData = [NSJSONSerialization dataWithJSONObject:eventsObject options:0 error:nil];
        NSString *updatedString = [[NSString alloc] initWithData:updatedData encoding:NSUTF8StringEncoding];
        [self.stallionStateManager setStringForKey:EVENTS_KEY value:updatedString];
    } @catch (NSException *exception) {
        [self cleanupEventStorage];
    }
}

- (void)cleanupEventStorage {
    [self.stallionStateManager setStringForKey:EVENTS_KEY value:@"{}"];
}

- (NSString *)popEvents {
    @try {
        NSString *eventsString = [self.stallionStateManager getStringForKey:EVENTS_KEY defaultValue:@"{}"];
        NSDictionary *eventsObject = [NSJSONSerialization JSONObjectWithData:[eventsString dataUsingEncoding:NSUTF8StringEncoding]
                                                                      options:NSJSONReadingMutableContainers
                                                                        error:nil];
        if (!eventsObject) {
            return @"[]";
        }

        NSMutableArray *batch = [NSMutableArray array];
        NSArray *keys = [eventsObject allKeys];
        for (int i = 0; i < MIN(keys.count, MAX_BATCH_COUNT_SIZE); i++) {
            NSString *key = keys[i];
            [batch addObject:eventsObject[key]];
        }

        NSData *batchData = [NSJSONSerialization dataWithJSONObject:batch options:0 error:nil];
        return [[NSString alloc] initWithData:batchData encoding:NSUTF8StringEncoding];
    } @catch (NSException *exception) {
        [self cleanupEventStorage];
    }

    return @"[]";
}

- (void)acknowledgeEvents:(NSArray<NSString *> *)eventIds {
    @try {
        NSString *eventsString = [self.stallionStateManager getStringForKey:EVENTS_KEY defaultValue:@"{}"];
        NSMutableDictionary *eventsObject = [[NSJSONSerialization JSONObjectWithData:[eventsString dataUsingEncoding:NSUTF8StringEncoding]
                                                                              options:NSJSONReadingMutableContainers
                                                                                error:nil] mutableCopy];
        if (!eventsObject) {
            return;
        }

        for (NSString *eventId in eventIds) {
            [eventsObject removeObjectForKey:eventId];
        }

        NSData *updatedData = [NSJSONSerialization dataWithJSONObject:eventsObject options:0 error:nil];
        NSString *updatedString = [[NSString alloc] initWithData:updatedData encoding:NSUTF8StringEncoding];
        [self.stallionStateManager setStringForKey:EVENTS_KEY value:updatedString];
    } @catch (NSException *exception) {
        // Ignore exceptions
    }
}

#pragma mark - RCTEventEmitter Overrides

// Required to specify supported events
- (NSArray<NSString *> *)supportedEvents {
    return @[STALLION_NATIVE_EVENT_NAME];
}

@end
