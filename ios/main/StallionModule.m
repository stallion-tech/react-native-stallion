//
//  StallionModule.m
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//
#import "StallionModule.h"
#import "StallionStateManager.h"
#import "StallionEventHandler.h"
#import "StallionObjConstants.h"
#import "StallionSlotManager.h"
#import "StallionFilemanager.h"
#import "StallionExceptionHandler.h"

@implementation StallionModule

+ (NSURL *)getBundleURL {
    return [self getBundleURL:nil];
}

+ (NSURL *)getBundleURL:(NSURL *)defaultBundlePath {
    [StallionStateManager initializeInstance];
    [StallionExceptionHandler initExceptionHandler];
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionConfig *config = stateManager.stallionConfig;
    NSString *currentAppVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:[StallionObjConstants app_version_identifier]];
    NSString *cachedAppVersion = [stateManager getStringForKey:[StallionObjConstants app_version_cache_key] defaultValue:@""];

    // Validate app version and perform fallback if required
    if (![currentAppVersion isEqualToString:cachedAppVersion]) {
        [stateManager setStringForKey:[StallionObjConstants app_version_cache_key] value:currentAppVersion];
        [StallionSlotManager fallbackProd];
    }

    NSString *baseFolderPath = config.filesDirectory;
    StallionMeta *stallionMeta = stateManager.stallionMeta;
    SwitchState switchState = stallionMeta.switchState;

  if (switchState == SwitchStateProd) {
        return [self getProdBundlePath:baseFolderPath defaultBundlePath:defaultBundlePath];
  } else if (switchState == SwitchStateStage) {
        return [self getStageBundlePath:baseFolderPath defaultBundlePath:defaultBundlePath];
    }

    return [self getDefaultBundle:defaultBundlePath];
}

+ (NSURL *)getProdBundlePath:(NSString *)baseFolderPath defaultBundlePath:(NSURL *)defaultBundlePath {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *stallionMeta = stateManager.stallionMeta;

    [self mountNewProdBundle:baseFolderPath];

    switch (stallionMeta.currentProdSlot) {
        case SlotStateNewSlot:
            return [self resolveBundlePath:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]]
                          defaultBundlePath:defaultBundlePath
                               releaseHash:stallionMeta.prodNewHash
                                    isProd:true];
        case SlotStateStableSlot:
            return [self resolveBundlePath:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants prod_directory], [StallionObjConstants stable_folder_slot]]
                          defaultBundlePath:defaultBundlePath
                               releaseHash:stallionMeta.prodStableHash
                                    isProd:true];
        default:
            return [self getDefaultBundle:defaultBundlePath];
    }
}

+ (NSURL *)getStageBundlePath:(NSString *)baseFolderPath defaultBundlePath:(NSURL *)defaultBundlePath {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *stallionMeta = stateManager.stallionMeta;

    [self mountNewStageBundle:baseFolderPath];

    switch (stallionMeta.currentStageSlot) {
        case SlotStateNewSlot:
            return [self resolveBundlePath:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants stage_directory], [StallionObjConstants new_folder_slot]]
                          defaultBundlePath:defaultBundlePath
                               releaseHash:stallionMeta.stageNewHash isProd:false];
        default:
            return [self getDefaultBundle:defaultBundlePath];
    }
}

+ (void)mountNewProdBundle:(NSString *)baseFolderPath {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *stallionMeta = stateManager.stallionMeta;
    NSString *prodTempHash = stallionMeta.prodTempHash;

    if (prodTempHash && prodTempHash.length > 0) {
        @try {
            [StallionFileManager moveFileFrom:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants prod_directory], [StallionObjConstants temp_folder_slot]]
                                            to:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]]];
            stallionMeta.prodNewHash = prodTempHash;
            stallionMeta.prodTempHash = @"";
            [stateManager syncStallionMeta];
            [self sendInstallEvent:prodTempHash];
        } @catch (NSException *exception) {
            NSLog(@"Error mounting new prod bundle: %@", exception.reason);
        }
    }
}

+ (void)mountNewStageBundle:(NSString *)baseFolderPath {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *stallionMeta = stateManager.stallionMeta;
    NSString *stageTempHash = stallionMeta.stageTempHash;

    if (stageTempHash && stageTempHash.length > 0) {
        @try {
            [StallionFileManager moveFileFrom:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants stage_directory], [StallionObjConstants temp_folder_slot]]
                                            to:[NSString stringWithFormat:@"%@/%@/%@", baseFolderPath, [StallionObjConstants stage_directory], [StallionObjConstants new_folder_slot]]];
            stallionMeta.stageNewHash = stageTempHash;
            stallionMeta.stageTempHash = @"";
            [stateManager syncStallionMeta];
        } @catch (NSException *exception) {
            NSLog(@"Error mounting new stage bundle: %@", exception.reason);
        }
    }
}

+ (NSURL *)resolveBundlePath:(NSString *)folderPath defaultBundlePath:(NSURL *)defaultBundlePath releaseHash:(NSString *)releaseHash isProd:(Boolean*)isProd{
    NSString *bundlePath = [NSString stringWithFormat:@"%@/%@/%@", folderPath, [StallionObjConstants build_folder_name], [StallionObjConstants bundle_file_name]];
    if ([[NSFileManager defaultManager] fileExistsAtPath:bundlePath]) {
        return [NSURL fileURLWithPath:bundlePath];
    } else {
        [self sendCorruptionEvent:releaseHash folderPath:folderPath];
        if(isProd) {
            [StallionSlotManager rollbackProdWithAutoRollback:true errorString:@"Corruped File not found"];
        } else {
            [StallionSlotManager rollbackStage];
        }
        return [self getDefaultBundle:defaultBundlePath];
    }
}

+ (void)sendInstallEvent:(NSString *)releaseHash {
    NSDictionary *eventPayload = @{[StallionObjConstants release_hash_key]: releaseHash};
  [[StallionEventHandler sharedInstance] cacheEvent:[StallionObjConstants installed_prod_event] eventPayload:eventPayload];
}

+ (void)sendCorruptionEvent:(NSString *)releaseHash folderPath:(NSString *)folderPath {
    NSDictionary *eventPayload = @{
        [StallionObjConstants release_hash_key]: releaseHash,
        @"meta": folderPath
    };
    [[StallionEventHandler sharedInstance] cacheEvent:@"CORRUPTED_FILE_ERROR" eventPayload:eventPayload];
}

+ (NSURL *)getDefaultBundle:(NSURL *)defaultBundlePath {
    NSURL *defaultRNBundlePath = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    return defaultBundlePath ?: defaultRNBundlePath;
}

@end
