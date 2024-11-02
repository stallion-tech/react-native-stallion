//
//  StallionModule.m
//  react-native-stallion
//
//  Created by Thor963 on 17/05/23.
//

#import "StallionModule.h"
#import "StallionErrorBoundary.h"
#import "StallionEventManager.h"
#import "StallionObjConstants.h"
#import "StallionRollbackHandler.h"

@implementation StallionModule

  + (NSURL *)getBundleURL {
      return [self getBundleURL:nil];
  }

  + (NSURL *)getDefaultURL:(NSURL *)defaultBundleURL {
    NSURL *defaultRNBundlePath = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
    if(defaultBundleURL != nil) {
      return defaultBundleURL;
    } else return defaultRNBundlePath;
  }

+ (void)initExceptionHandling {
    [StallionErrorBoundary initErrorBoundary];
    [StallionErrorBoundary toggleExceptionHandler:TRUE];
}

+ (NSURL *)getBundlePathFromDirectory:(NSString *)directoryPath {
  NSString *bundlePath = [NSString stringWithFormat:@"%@/%@/%@", directoryPath, [StallionObjConstants build_folder_name], [StallionObjConstants bundle_file_name]];
    return [NSURL fileURLWithPath:bundlePath];
}

  + (NSURL *)getBundleURL:(NSURL *)defaultBundleURL {
    NSString *switchState = [[NSUserDefaults standardUserDefaults] stringForKey:StallionObjConstants.switch_state_identifier] ?: @"";
    NSString *cachedAppVersion = [[NSUserDefaults standardUserDefaults] stringForKey:StallionObjConstants.app_version_cache_key] ?: @"";
    NSString *currentAppVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:StallionObjConstants.app_version_identifier];
      if (currentAppVersion != cachedAppVersion) {
        [[NSUserDefaults standardUserDefaults] setObject:currentAppVersion forKey:StallionObjConstants.app_version_cache_key];
        [StallionRollbackHandler fallbackProd];
      }
    
      NSFileManager *fileManager = [NSFileManager defaultManager];
      NSError *error = nil;
      NSString *documentDirectoryPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
    
    NSString *tempDirectoryPath = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants temp_folder_slot]];
    NSString *newDirectoryPath = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
    NSString *stableDirectoryPath = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants stable_folder_slot]];
    
      NSString *tempDirectoryProd = [documentDirectoryPath stringByAppendingPathComponent:tempDirectoryPath];
    NSString *newDirectoryProd = [documentDirectoryPath stringByAppendingPathComponent:newDirectoryPath];
    NSString *stableDirectoryProd = [documentDirectoryPath stringByAppendingPathComponent:stableDirectoryPath];
    
    NSString *tempDirectoryPathStage = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants stage_directory], [StallionObjConstants temp_folder_slot]];
    NSString *newDirectoryPathStage = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants stage_directory], [StallionObjConstants new_folder_slot]];
    
      NSString *tempDirectoryStage = [documentDirectoryPath stringByAppendingPathComponent:tempDirectoryPathStage];
      NSString *newDirectoryStage = [documentDirectoryPath stringByAppendingPathComponent:newDirectoryPathStage];
    
    // possible slots
    NSString *newFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants new_folder_slot]];
    NSString *stableFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants stable_folder_slot]];
    NSString *tempFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants temp_folder_slot]];
    
      if (switchState == nil || [switchState isEqual:@""]) {
        [[NSUserDefaults standardUserDefaults] setObject:StallionObjConstants.switch_state_prod forKey:StallionObjConstants.switch_state_identifier];
        switchState = StallionObjConstants.switch_state_prod;
      }
      if([switchState isEqual:StallionObjConstants.switch_state_prod]) {
        NSString *currentProdSlot = [[NSUserDefaults standardUserDefaults] stringForKey:StallionObjConstants.current_prod_slot_key] ?: @"";
        
        if([currentProdSlot isEqual:tempFolderSlot]) {
          NSString *newHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
          NSString *newReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:newHashPath] ?: @"";
          
          if(![newReleaseHash isEqual:@""]) {
            [StallionRollbackHandler stabilizeRelease];
          }
          
          NSString *tempHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants temp_folder_slot]];
          NSString *tempReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:tempHashPath] ?: @"";
          [fileManager removeItemAtPath:newDirectoryProd error:&error];
          [fileManager moveItemAtPath:tempDirectoryProd toPath:newDirectoryProd error:&error];
          [fileManager removeItemAtPath:tempDirectoryProd error:&error];
          [StallionRollbackHandler promoteTempProd];
          [[StallionEventManager sharedInstance] queueRNEvent: StallionObjConstants.installed_prod_event withData:@{StallionObjConstants.release_hash_key:tempReleaseHash}];
          [self initExceptionHandling];
          return [self getBundlePathFromDirectory:newDirectoryProd];
        }
        if([currentProdSlot isEqual:newFolderSlot]) {
          [self initExceptionHandling];
          return [self getBundlePathFromDirectory:newDirectoryProd];
        }
        if([currentProdSlot isEqual:stableFolderSlot]) {
          [self initExceptionHandling];
          return [self getBundlePathFromDirectory:stableDirectoryProd];
        }
        return [self getDefaultURL:defaultBundleURL];
      }
    
    if([switchState isEqual:StallionObjConstants.switch_state_stage]) {
      NSString *currentStageSlot = [[NSUserDefaults standardUserDefaults] stringForKey:StallionObjConstants.current_stage_slot_key] ?: @"";
      if([currentStageSlot isEqual:tempFolderSlot]) {
        [fileManager removeItemAtPath:newDirectoryStage error:&error];
        [fileManager moveItemAtPath:tempDirectoryStage toPath:newDirectoryStage error:&error];
        [StallionRollbackHandler promoteTempStage];
        [self initExceptionHandling];
        return [self getBundlePathFromDirectory:newDirectoryStage];
      }
      if([currentStageSlot isEqual:newFolderSlot]) {
        [self initExceptionHandling];
        return [self getBundlePathFromDirectory:newDirectoryStage];
      }
      return [self getDefaultURL:defaultBundleURL];
    }
    return [self getDefaultURL:defaultBundleURL];
  }

@end
