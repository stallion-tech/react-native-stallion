//
//  StallionConfig.h
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import <Foundation/Foundation.h>

@interface StallionConfig : NSObject

@property (nonatomic, copy, readonly) NSString *uid;
@property (nonatomic, copy, readonly) NSString *projectId;
@property (nonatomic, copy, readonly) NSString *appToken;
@property (nonatomic, copy) NSString *sdkToken;
@property (nonatomic, copy, readonly) NSString *appVersion;
@property (nonatomic, copy, readonly) NSString *filesDirectory;
@property (nonatomic, copy, readonly) NSString *publicSigningKey;
@property (nonatomic, copy) NSString *lastUnverifiedHash;

- (instancetype)initWithDefaults:(NSUserDefaults *)defaults;

- (void)updateSdkToken:(NSString *)newSdkToken;
- (void)updateLastUnverifiedHash:(NSString *)newUnverifiedHash;
- (NSDictionary *)toDictionary;

@end
