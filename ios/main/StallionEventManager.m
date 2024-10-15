//
//  StallionEventManager.m
//  react-native-stallion
//
//  Created by Thor963  on 26/09/24.
//

#import "StallionEventManager.h"
#import "StallionObjConstants.h"

@implementation StallionEventManager

#define kStallionEventListKey @"StallionEventListKey"

// Singleton instance method implementation
+ (instancetype)sharedInstance {
    static StallionEventManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[self alloc] init];
    });
    return sharedInstance;
}

// Helper method to retrieve events from NSUserDefaults
- (NSMutableArray *)getStoredEvents {
    NSArray *storedEvents = [[NSUserDefaults standardUserDefaults] objectForKey:kStallionEventListKey];
    if (storedEvents) {
        return [storedEvents mutableCopy];
    }
    return [[NSMutableArray alloc] init];
}

// Helper method to save events to NSUserDefaults
- (void)saveEvents:(NSArray *)events {
    [[NSUserDefaults standardUserDefaults] setObject:events forKey:kStallionEventListKey];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

// Method to queue an event and store it in NSUserDefaults
- (void)queueRNEvent:(NSString *)eventType withData:(NSDictionary *)value {
    if (eventType && value) {
        NSMutableArray *eventList = [self getStoredEvents];
        NSDictionary *event = @{@"type": eventType, @"payload": value};
        [eventList addObject:event];
        [self saveEvents:eventList];
    }
}

// Method to flush all events from NSUserDefaults
- (NSArray *)flushAllEvents {
    NSMutableArray *eventList = [self getStoredEvents];
    [self saveEvents:@[]]; // Clear the event list in NSUserDefaults
    return [eventList copy];
}

@end
