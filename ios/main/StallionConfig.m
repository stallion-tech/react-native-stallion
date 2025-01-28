//
//  StallionConfig.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import "StallionConfig.h"
#import "StallionConfigConstants.h"

@implementation StallionConfig

- (instancetype)initWithDefaults:(NSUserDefaults *)defaults {
    self = [super init];
    if (self) {
        _projectId = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_PROJECT_ID_IDENTIFIER];;
        _appToken = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_APP_TOKEN_IDENTIFIER];;
        _sdkToken = [defaults stringForKey:API_KEY_IDENTIFIER];
        _appVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:STALLION_APP_VERSION_IDENTIFIER];
      
        _filesDirectory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES).firstObject;
      
      NSString *cachedUid = [defaults stringForKey:UNIQUE_ID_IDENTIFIER];
          if (cachedUid && ![cachedUid isEqualToString:@""]) {
            _uid = cachedUid;
          } else {
              NSString *newUid = @"";
              if ([UIDevice currentDevice].identifierForVendor) {
                  newUid = [UIDevice currentDevice].identifierForVendor.UUIDString;
              } else {
                  newUid = [[NSUUID UUID] UUIDString];
              }
              [defaults setObject:newUid forKey:UNIQUE_ID_IDENTIFIER];
              [defaults synchronize];
            _uid = newUid;
          }
    }
    return self;
}

- (void)updateSdkToken:(NSString *)newSdkToken {
    _sdkToken = newSdkToken;
    [[NSUserDefaults standardUserDefaults] setObject:newSdkToken forKey:API_KEY_IDENTIFIER];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

- (NSDictionary *)toDictionary {
    return @{
        @"uid": self.uid,
        @"projectId": self.projectId,
        @"appToken": self.appToken,
        @"sdkToken": self.sdkToken,
        @"appVersion": self.appVersion
    };
}

@end
