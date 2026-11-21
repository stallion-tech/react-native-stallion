//
//  StallionConfig.m
//  DoubleConversion
//
//  Created by Thor963 on 28/01/25.
//

#import "StallionConfig.h"
#import "StallionConfigConstants.h"
#import "StallionObjConstants.h"

static NSString *StallionTrimmedFile(NSString *path) {
    if (path.length == 0) {
        return nil;
    }
    NSString *text = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
    if (text.length == 0) {
        return nil;
    }
    text = [text stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    return text.length > 0 ? text : nil;
}

static NSString *StallionFingerprintInBundle(NSBundle *bundle) {
    if (bundle == nil) {
        return nil;
    }
    NSURL *resourceURL = [bundle URLForResource:@"StallionFingerprint" withExtension:@"bundle"];
    if (resourceURL != nil) {
        NSBundle *resourceBundle = [NSBundle bundleWithURL:resourceURL];
        NSString *bundled = StallionTrimmedFile([resourceBundle pathForResource:@"stallion_fingerprint" ofType:@"txt"]);
        if (bundled != nil) {
            return bundled;
        }
    }
    return StallionTrimmedFile([bundle pathForResource:@"stallion_fingerprint" ofType:@"txt"]);
}

static NSString *StallionReadNativeFingerprint(void) {
    NSString *fromOwner = StallionFingerprintInBundle([NSBundle bundleForClass:[StallionConfig class]]);
    if (fromOwner != nil) {
        return fromOwner;
    }
    NSString *fromMain = StallionFingerprintInBundle([NSBundle mainBundle]);
    if (fromMain != nil) {
        return fromMain;
    }
    return @"unknown";
}

@implementation StallionConfig

- (instancetype)initWithDefaults:(NSUserDefaults *)defaults {
    self = [super init];
    if (self) {
        _projectId = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_PROJECT_ID_IDENTIFIER] ?: @"";
        _appToken = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_APP_TOKEN_IDENTIFIER] ?: @"";
        _sdkToken = [defaults stringForKey:API_KEY_IDENTIFIER] ?: @"";
        _appVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_APP_VERSION_IDENTIFIER] ?: @"";
        _nativeFingerprint = StallionReadNativeFingerprint() ?: @"unknown";
        _filesDirectory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject ?: @"";
        _publicSigningKey = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_PUBLIC_SIGNING_KEY_IDENTIFIER] ?: @"";
        _lastUnverifiedHash = [defaults stringForKey:LAST_UNVERIFIED_KEY_IDENTIFIER] ?: @"";
        _baseUrl = [defaults stringForKey:BASE_URL_IDENTIFIER] ?: @"";

        // get or generate UID (random install-scoped UUID)
        NSString *cachedUid = [defaults stringForKey:UNIQUE_ID_IDENTIFIER];
        if (cachedUid && ![cachedUid isEqualToString:@""]) {
            _uid = cachedUid;
        } else {
            NSString *newUid = [[NSUUID UUID] UUIDString];
            [defaults setObject:newUid forKey:UNIQUE_ID_IDENTIFIER];
            [defaults synchronize];
            _uid = newUid;
        }
    }
    return self;
}

- (void)updateSdkToken:(NSString *)newSdkToken {
    _sdkToken = newSdkToken ?: @"";
    [[NSUserDefaults standardUserDefaults] setObject:_sdkToken forKey:API_KEY_IDENTIFIER];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)updateLastUnverifiedHash:(NSString *)newUnverifiedHash {
    _lastUnverifiedHash = newUnverifiedHash ?: @"";
    [[NSUserDefaults standardUserDefaults] setObject:_lastUnverifiedHash forKey:LAST_UNVERIFIED_KEY_IDENTIFIER];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (void)updateBaseUrl:(NSString *)newBaseUrl {
    if (newBaseUrl == nil || [newBaseUrl length] == 0) {
        _baseUrl = @"";
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:BASE_URL_IDENTIFIER];
    } else {
        _baseUrl = newBaseUrl;
        [[NSUserDefaults standardUserDefaults] setObject:_baseUrl forKey:BASE_URL_IDENTIFIER];
    }
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSDictionary *)toDictionary {
    @try {
        return @{
            @"uid": self.uid ?: @"",
            @"projectId": self.projectId ?: @"",
            @"appToken": self.appToken ?: @"",
            @"sdkToken": self.sdkToken ?: @"",
            @"appVersion": self.appVersion ?: @"",
            @"nativeFingerprint": self.nativeFingerprint ?: @"unknown",
            @"baseUrl": self.baseUrl ?: @""
        };
    } @catch (NSException *exception) {
        NSLog(@"Error in toDictionary: %@", exception.reason);
        return @{};
    }
}

@end
