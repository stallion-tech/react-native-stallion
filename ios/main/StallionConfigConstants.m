//
//  StallionConfigConstants.m
//  DoubleConversion
//
//  Created by Jasbir Singh Shergill on 28/01/25.
//

#import "StallionConfigConstants.h"

@implementation StallionConfigConstants

NSString *const MODULE_NAME = @"Stallion";

NSString *const STALLION_PROJECT_ID_IDENTIFIER = @"StallionProjectId";
NSString *const STALLION_APP_TOKEN_IDENTIFIER = @"StallionAppToken";
NSString *const STALLION_APP_VERSION_IDENTIFIER = @"CFBundleShortVersionString";
NSString *const STALLION_META_IDENTIFIER = @"stallion_meta";

NSString *const UNIQUE_ID_IDENTIFIER = @"stallionDeviceId";
NSString *const API_KEY_IDENTIFIER = @"x-sdk-pin-access-token";

NSString *const PROD_DIRECTORY = @"/StallionProd";
NSString *const STAGE_DIRECTORY = @"/StallionStage";
NSString *const TEMP_FOLDER_SLOT = @"/temp";
NSString *const NEW_FOLDER_SLOT = @"/StallionNew";
NSString *const STABLE_FOLDER_SLOT = @"/StallionStable";

NSString *const ANDROID_BUNDLE_FILE_NAME = @"/index.android.bundle";
NSString *const DEFAULT_JS_BUNDLE_LOCATION_BASE = @"assets:/";
NSString *const UNZIP_FOLDER_NAME = @"/build";

NSString *const LAST_DOWNLOADING_URL_IDENTIFIER = @"/STALLION_LAST_DOWNLOADING_URL";

@end
