//
//  StallionStateManager.h
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import <Foundation/Foundation.h>
#import "StallionMeta.h"
#import "StallionConfig.h"

@interface StallionStateManager : NSObject

@property (nonatomic, strong, readonly) StallionConfig *stallionConfig;
@property (nonatomic, strong) StallionMeta *stallionMeta;
@property (nonatomic, assign) BOOL isMounted;
@property (nonatomic, copy) NSString *pendingReleaseUrl;
@property (nonatomic, copy) NSString *pendingReleaseHash;

+ (instancetype)sharedInstance;
+ (void)initializeInstance;

- (void)updateStallionMeta:(StallionMeta *)newMeta;
- (void)syncStallionMeta;
- (StallionMeta *)fetchStallionMeta;
- (void)clearStallionMeta;

// Local storage methods
- (NSString *)getStringForKey:(NSString *)key defaultValue:(NSString *)defaultValue;
- (void)setStringForKey:(NSString *)key value:(NSString *)value;
@end
