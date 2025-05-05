//
//  StallionObjConstants.m
//  react-native-stallion
//
//  Created by Thor963  on 27/09/24.
//

#import "StallionObjConstants.h"

@implementation StallionObjConstants

+ (NSString *)prod_directory {
    return @"StallionProd";
}

+ (NSString *)stage_directory {
    return @"StallionStage";
}

+ (NSString *)temp_folder_slot {
    return @"temp";
}

+ (NSString *)new_folder_slot {
    return @"StallionNew";
}

+ (NSString *)stable_folder_slot {
    return @"StallionStable";
}

+ (NSString *)default_folder_slot {
    return @"Default";
}

+ (NSString *)current_prod_slot_key {
    return @"stallionProdCurrentSlot";
}

+ (NSString *)current_stage_slot_key {
    return @"stallionStageCurrentSlot";
}

+ (NSString *)stallion_project_id_identifier {
    return @"StallionProjectId";
}

+ (NSString *)stallion_app_token_identifier {
    return @"StallionAppToken";
}

+ (NSString *)app_version_identifier {
    return @"CFBundleShortVersionString";
}

+ (NSString *)stallion_app_token_key {
    return @"x-app-token";
}

+ (NSString *)stallion_sdk_token_key {
    return @"x-sdk-access-token";
}

+ (NSString *)switch_state_prod {
    return @"PROD";
}

+ (NSString *)switch_state_stage {
    return @"STAGE";
}

+ (NSString *)switch_state_identifier {
    return @"switchState";
}

+ (NSString *)rolled_back_prod_event {
    return @"ROLLED_BACK_PROD";
}

+ (NSString *)auto_rolled_back_prod_event {
    return @"AUTO_ROLLED_BACK_PROD";
}

+ (NSString *)installed_prod_event {
    return @"INSTALLED_PROD";
}

+ (NSString *)installed_stage_event {
    return @"INSTALLED_STAGE";
}

+ (NSString *)exception_prod_event {
    return @"EXCEPTION_PROD";
}

+ (NSString *)exception_stage_event {
    return @"EXCEPTION_STAGE";
}

+ (NSString *)stabilized_prod_event {
    return @"STABILIZED_PROD";
}

+ (NSString *)release_hash_key {
    return @"releaseHash";
}

+ (NSString *)is_auto_rollback_key {
    return @"isAutoRollback";
}

+ (NSString *)app_version_cache_key {
    return @"cachedAppVersion";
}

+ (NSString *)build_folder_name {
    return @"build";
}

+ (NSString *)bundle_file_name {
    return @"main.jsbundle";
}

+ (NSString *)stallion_native_event {
    return @"STALLION_NATIVE_EVENT";
}

+ (NSString *)last_rolled_back_release_hash_key {
    return @"LAST_ROLLED_BACK_RELEASE_HASH";
}

@end
