//
//  StallionRollbackHandler.m
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 27/09/24.
//

#import "StallionRollbackHandler.h"
#import "StallionObjConstants.h"
#import "StallionEventManager.h"

@implementation StallionRollbackHandler

+ (void)sendRollbackEvent:(BOOL)isAutoRollback releaseHash:(NSString *)releaseHash {
  [[StallionEventManager sharedInstance] queueRNEvent: isAutoRollback ? StallionObjConstants.auto_rolled_back_prod_event : StallionObjConstants.rolled_back_prod_event withData:@{StallionObjConstants.release_hash_key : releaseHash}];
  if(isAutoRollback) {
    [[NSUserDefaults standardUserDefaults] setObject: releaseHash forKey:StallionObjConstants.last_rolled_back_release_hash_key];
  }
}

+ (void)rollbackProd:(BOOL)isAutoRollback {
    NSString *currentProdSlot = [[NSUserDefaults standardUserDefaults] stringForKey:StallionObjConstants.current_prod_slot_key];
    
    // possible hashes
    NSString *stableHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants stable_folder_slot]];
    NSString *stableReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:stableHashPath];
    NSString *newHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
    NSString *newReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:newHashPath];
    
    // possible slots
    NSString *tempFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants temp_folder_slot]];
    NSString *newFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants new_folder_slot]];
    NSString *stableFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants stable_folder_slot]];
    NSString *defaultFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants default_folder_slot]];
    
    if([currentProdSlot isEqual:newFolderSlot]) {
      // empty new hash
      [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:newHashPath];
      if([stableReleaseHash isEqual:@""]) {
        [[NSUserDefaults standardUserDefaults] setObject: defaultFolderSlot forKey:StallionObjConstants.current_prod_slot_key];
      } else {
        [[NSUserDefaults standardUserDefaults] setObject: stableFolderSlot forKey:StallionObjConstants.current_prod_slot_key];
      }
      [self sendRollbackEvent:isAutoRollback releaseHash:newReleaseHash];
    } else if([currentProdSlot isEqual:stableFolderSlot]) {
      [[NSUserDefaults standardUserDefaults] setObject: defaultFolderSlot forKey:StallionObjConstants.current_prod_slot_key];
      [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:stableHashPath];
      [self sendRollbackEvent:isAutoRollback releaseHash:stableReleaseHash];
    }
    [[NSUserDefaults standardUserDefaults] synchronize];
  }

+ (void)fallbackProd {
  NSString *stableHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants stable_folder_slot]];
  NSString *newHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
  NSString *tempHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants temp_folder_slot]];
  NSString *defaultFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants default_folder_slot]];
  
  [[NSUserDefaults standardUserDefaults] setObject: defaultFolderSlot forKey:StallionObjConstants.current_prod_slot_key];
  [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:newHashPath];
  [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:stableHashPath];
  [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:tempHashPath];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

+ (void)rollbackStage {
  NSString *defaultFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants default_folder_slot]];
  NSString *newHashPathStage = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants stage_directory], [StallionObjConstants new_folder_slot]];
  [[NSUserDefaults standardUserDefaults] setObject:defaultFolderSlot forKey:StallionObjConstants.current_stage_slot_key];
  [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:newHashPathStage];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

+ (void)promoteTempProd {
  NSString *tempHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants temp_folder_slot]];
  NSString *tempReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:tempHashPath];
  
  NSString *newHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
  
  NSString *newFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants new_folder_slot]];
  
  [[NSUserDefaults standardUserDefaults] setObject: tempReleaseHash forKey:newHashPath];
  [[NSUserDefaults standardUserDefaults] setObject: newFolderSlot forKey:StallionObjConstants.current_prod_slot_key];
  [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:tempHashPath];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

+ (void)promoteTempStage {
  NSString *tempHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants stage_directory], [StallionObjConstants temp_folder_slot]];
  NSString *tempReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:tempHashPath];
  
  NSString *newHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants stage_directory], [StallionObjConstants new_folder_slot]];
  
  NSString *newFolderSlot = [NSString stringWithFormat:@"/%@", [StallionObjConstants new_folder_slot]];
  
  [[NSUserDefaults standardUserDefaults] setObject: tempReleaseHash forKey:newHashPath];
  [[NSUserDefaults standardUserDefaults] setObject: newFolderSlot forKey:StallionObjConstants.current_stage_slot_key];
  [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:tempHashPath];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

+ (void)stabilizeRelease {
  NSString *newHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
  NSString *newReleaseHash = [[NSUserDefaults standardUserDefaults] stringForKey:newHashPath];
  
  if(![newReleaseHash isEqual:@""]) {
    NSString *stableHashPath = [NSString stringWithFormat:@"/%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants stable_folder_slot]];
    
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;
    NSString *newDirectoryPath = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants new_folder_slot]];
    NSString *stableDirectoryPath = [NSString stringWithFormat:@"%@/%@", [StallionObjConstants prod_directory], [StallionObjConstants stable_folder_slot]];
    NSString *documentDirectoryPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
    NSString *newDirectoryProd = [documentDirectoryPath stringByAppendingPathComponent:newDirectoryPath];
    NSString *stableDirectoryProd = [documentDirectoryPath stringByAppendingPathComponent:stableDirectoryPath];
    
    [fileManager removeItemAtPath:stableDirectoryProd error:&error];
    [fileManager moveItemAtPath:newDirectoryProd toPath:stableDirectoryProd error:&error];
    [fileManager removeItemAtPath:newDirectoryProd error:&error];
    
    [[NSUserDefaults standardUserDefaults] setObject: newReleaseHash forKey:stableHashPath];
    [[NSUserDefaults standardUserDefaults] setObject: @"" forKey:newHashPath];
    
    [[StallionEventManager sharedInstance] queueRNEvent: StallionObjConstants.stabilized_prod_event withData:@{StallionObjConstants.release_hash_key : newReleaseHash}];
  }
}

@end
