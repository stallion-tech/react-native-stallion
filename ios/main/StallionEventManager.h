
//
//  StallionEventManager.m
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 26/09/24.
//


@interface StallionEventManager : NSObject

// Singleton instance method
+ (instancetype)sharedInstance;

// Method to queue an event
- (void)queueRNEvent:(NSString *)eventType withData:(NSDictionary *)value;

// Method to flush all events
- (NSArray *)flushAllEvents;

@end
