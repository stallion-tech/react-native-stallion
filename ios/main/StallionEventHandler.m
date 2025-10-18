//
//  StallionEventHandler.m
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
//

#import "StallionEventHandler.h"
#import "StallionStateManager.h"
#import "StallionVersion.h"

#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTEventEmitter.h>

static NSString *const STALLION_NATIVE_EVENT_NAME = @"STALLION_NATIVE_EVENT";
static NSString *const EVENTS_KEY = @"stored_events";
static NSInteger const MAX_BATCH_COUNT_SIZE = 9;
static NSInteger const MAX_EVENT_STORAGE_LIMIT = 20;

@implementation StallionEventHandler

+ (instancetype)sharedInstance {
    static StallionEventHandler *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

// Emit event to React Native and store locally
- (void)cacheEvent:(NSString *)eventName eventPayload:(NSDictionary *)eventPayload {
    StallionStateManager *stallionStateManager = [StallionStateManager sharedInstance];

    NSString *projectId = stallionStateManager.stallionConfig.projectId ?: @"";
    NSString *appVersion = stallionStateManager.stallionConfig.appVersion ?: @"";
    NSString *uid = stallionStateManager.stallionConfig.uid ?: @"";

    NSMutableDictionary *mutablePayload = [eventPayload mutableCopy];
    NSString *uniqueId = [[NSUUID UUID] UUIDString];
    mutablePayload[@"eventId"] = uniqueId;
    mutablePayload[@"eventTimestamp"] = @((NSInteger)([[NSDate date] timeIntervalSince1970] * 1000));
    mutablePayload[@"eventType"] = eventName;
    mutablePayload[@"projectId"] = projectId;
    mutablePayload[@"platform"] = @"ios";
    mutablePayload[@"appVersion"] = appVersion;
    mutablePayload[@"uid"] = uid;
    mutablePayload[@"sdkVersion"] = STALLION_SDK_VERSION;
    // Store event locally
    [self storeEventLocally:uniqueId eventPayload:mutablePayload];
}

// Store event locally in StallionStateManager
- (void)storeEventLocally:(NSString *)uniqueId eventPayload:(NSDictionary *)eventPayload {
    StallionStateManager *stallionStateManager = [StallionStateManager sharedInstance];
    @try {
        NSString *eventsString = [stallionStateManager getStringForKey:EVENTS_KEY defaultValue:@"{}"];
        
        NSMutableDictionary *eventsObject = [NSJSONSerialization JSONObjectWithData:[eventsString dataUsingEncoding:NSUTF8StringEncoding]
                                                                            options:NSJSONReadingMutableContainers
                                                                              error:nil];

        if (!eventsObject) {
            eventsObject = [NSMutableDictionary dictionary];
        }

        // Enforce max size
        if (eventsObject.count >= MAX_EVENT_STORAGE_LIMIT) {
            eventsObject = [NSMutableDictionary dictionary];
        }

        eventsObject[uniqueId] = eventPayload;

        NSData *updatedData = [NSJSONSerialization dataWithJSONObject:eventsObject options:0 error:nil];
        NSString *updatedString = [[NSString alloc] initWithData:updatedData encoding:NSUTF8StringEncoding];

        [stallionStateManager setStringForKey:EVENTS_KEY value:updatedString];
    } @catch (NSException *exception) {
        [self cleanupEventStorage];
    }
}

// Cleanup event storage
- (void)cleanupEventStorage {
    StallionStateManager *stallionStateManager = [StallionStateManager sharedInstance];
    [stallionStateManager setStringForKey:EVENTS_KEY value:@"{}"];
}

// Fetch stored events and return as JSON string
- (NSString *)popEvents {
    StallionStateManager *stallionStateManager = [StallionStateManager sharedInstance];
    @try {
        NSString *eventsString = [stallionStateManager getStringForKey:EVENTS_KEY defaultValue:@"{}"];
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

// Acknowledge (remove) events by ID
- (void)acknowledgeEvents:(NSArray<NSString *> *)eventIds {
    StallionStateManager *stallionStateManager = [StallionStateManager sharedInstance];
    @try {
        NSString *eventsString = [stallionStateManager getStringForKey:EVENTS_KEY defaultValue:@"{}"];
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

        [stallionStateManager setStringForKey:EVENTS_KEY value:updatedString];
    } @catch (NSException *exception) {
        // Ignore exceptions
    }
}

@end
