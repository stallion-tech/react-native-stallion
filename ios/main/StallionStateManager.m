//
//  StallionStateManager.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import "StallionStateManager.h"
#import "StallionConfigConstants.h"

@implementation StallionStateManager {
    NSUserDefaults *_defaults;
}

static StallionStateManager *_instance = nil;

+ (instancetype)sharedInstance {
    if (!_instance) {
        @throw [NSException exceptionWithName:@"UninitializedException"
                                       reason:@"Call initializeInstance first"
                                     userInfo:nil];
    }
    return _instance;
}

+ (void)initializeInstance {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[StallionStateManager alloc] init];
    });
}

- (instancetype)init {
    self = [super init];
    if (self) {
        // Create or retrieve NSUserDefaults instance
        _defaults = [NSUserDefaults standardUserDefaults];
        
        // Initialize StallionConfig with NSUserDefaults
        _stallionConfig = [[StallionConfig alloc] initWithDefaults:_defaults];
        
        // Fetch or initialize StallionMeta
        _stallionMeta = [self fetchStallionMeta];
        
        // Initialize other properties
        _isMounted = NO;
        _pendingReleaseUrl = @"";
        _pendingReleaseHash = @"";
    }
    return self;
}

- (void)updateStallionMeta:(StallionMeta *)newMeta {
    self.stallionMeta = newMeta;
    [self syncStallionMeta];
}

- (void)syncStallionMeta {
    if (self.stallionMeta) {
        [_defaults setObject:[self.stallionMeta toDictionary] forKey:STALLION_META_IDENTIFIER];
        [_defaults synchronize];
    }
}

- (StallionMeta *)fetchStallionMeta {
    NSDictionary *metaDict = [_defaults objectForKey:STALLION_META_IDENTIFIER];
    return metaDict ? [StallionMeta fromDictionary:metaDict] : [[StallionMeta alloc] init];
}

- (void)clearStallionMeta {
    [self.stallionMeta reset];
    [self syncStallionMeta];
}

#pragma mark - Local Storage Methods

- (NSString *)getStringForKey:(NSString *)key defaultValue:(NSString *)defaultValue {
    NSString *value = [_defaults objectForKey:key];
    return value ? value : defaultValue;
}

- (void)setStringForKey:(NSString *)key value:(NSString *)value {
    if (key && value) {
        [_defaults setObject:value forKey:key];
        [_defaults synchronize];
    }
}

@end
