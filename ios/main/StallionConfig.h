//
//  StallionConfig.h
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
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
@property (nonatomic, copy) NSString *baseUrl;

- (instancetype)initWithDefaults:(NSUserDefaults *)defaults;

- (void)updateSdkToken:(NSString *)newSdkToken;
- (void)updateLastUnverifiedHash:(NSString *)newUnverifiedHash;
- (void)updateBaseUrl:(NSString *)newBaseUrl;
- (NSDictionary *)toDictionary;

@end
