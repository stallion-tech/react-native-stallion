//
//  StallionSlotManager.m
//  react-native-stallion
//
//  Created by Jasbir Singh Shergill on 29/01/25.
//

#import "StallionSlotManager.h"
#import "StallionStateManager.h"
#import "StallionMetaConstants.h"
#import "StallionEventHandler.h"
#import "StallionObjConstants.h"
#import "StallionFileManager.h"

@implementation StallionSlotManager

+ (void)rollbackProdWithAutoRollback:(BOOL)isAutoRollback errorString:(NSString *)errorString {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *meta = stateManager.stallionMeta;
    SlotStates currentProdSlot = meta.currentProdSlot;
    NSString *stableReleaseHash = meta.prodStableHash ?: @"";
    NSString *newReleaseHash = meta.prodNewHash ?: @"";

    switch (currentProdSlot) {
        case SlotStateNewSlot:
            [meta setProdNewHash:@""];
            if (stableReleaseHash.length == 0) {
                [meta setCurrentProdSlot:SlotStateDefaultSlot];
            } else {
                [meta setCurrentProdSlot:SlotStateStableSlot];
            }
            [self emitRollbackEvent:isAutoRollback rolledBackReleaseHash:newReleaseHash errorString:errorString];
            [stateManager syncStallionMeta];
            break;

        case SlotStateStableSlot:
            [meta setProdStableHash:@""];
            [meta setCurrentProdSlot:SlotStateDefaultSlot];
            [self emitRollbackEvent:isAutoRollback rolledBackReleaseHash:stableReleaseHash errorString:errorString];
            [stateManager syncStallionMeta];
            break;

        default:
            // Default slot, no rollback needed
            break;
    }
}

+ (void)fallbackProd {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    NSString *baseFolderPath = stateManager.stallionConfig.filesDirectory;

  [StallionFileManager deleteFileOrFolderSilently:[NSString stringWithFormat:@"%@%@%@", baseFolderPath, StallionObjConstants.prod_directory, StallionObjConstants.new_folder_slot]];
  [StallionFileManager deleteFileOrFolderSilently:[NSString stringWithFormat:@"%@%@%@", baseFolderPath, StallionObjConstants.prod_directory, StallionObjConstants.stable_folder_slot]];
  [StallionFileManager deleteFileOrFolderSilently:[NSString stringWithFormat:@"%@%@%@", baseFolderPath, StallionObjConstants.prod_directory, StallionObjConstants.temp_folder_slot]];

    [stateManager clearStallionMeta];
}

+ (void)rollbackStage {
    StallionStateManager *stateManager = [StallionStateManager sharedInstance];
    StallionMeta *meta = stateManager.stallionMeta;

    [meta setCurrentStageSlot:SlotStateDefaultSlot];
    [meta setStageNewHash:@""];
    [stateManager syncStallionMeta];
}

+ (void)stabilizeProd {
    @try {
        StallionStateManager *stateManager = [StallionStateManager sharedInstance];
        NSString *baseFolderPath = stateManager.stallionConfig.filesDirectory;

      NSString *newSlotPath = [NSString stringWithFormat:@"%@%@%@", baseFolderPath, StallionObjConstants.prod_directory, StallionObjConstants.new_folder_slot];
      NSString *stableSlotPath = [NSString stringWithFormat:@"%@%@%@", baseFolderPath, StallionObjConstants.prod_directory, StallionObjConstants.stable_folder_slot];

      [StallionFileManager copyFileOrDirectoryFrom:newSlotPath to:stableSlotPath];

        NSString *newReleaseHash = stateManager.stallionMeta.prodNewHash;
        [stateManager.stallionMeta setProdStableHash:newReleaseHash];
        [stateManager syncStallionMeta];
        [self emitStabilizeEvent:newReleaseHash];
    } @catch (NSException *exception) {
        NSLog(@"StabilizeProd failed: %@", exception.reason);
    }
}

#pragma mark - Event Emission

+ (void)emitRollbackEvent:(BOOL)isAutoRollback rolledBackReleaseHash:(NSString *)rolledBackReleaseHash errorString:(NSString *)errorString {
    NSMutableDictionary *eventPayload = [NSMutableDictionary dictionary];
    eventPayload[@"releaseHash"] = rolledBackReleaseHash;
    eventPayload[@"error"] = errorString;

  NSString *eventName = isAutoRollback ? StallionObjConstants.auto_rolled_back_prod_event : StallionObjConstants.rolled_back_prod_event;

    if (isAutoRollback) {
        StallionStateManager *stateManager = [StallionStateManager sharedInstance];
        [stateManager.stallionMeta setLastRolledBackHash:rolledBackReleaseHash];
        [stateManager syncStallionMeta];
    }

    [[StallionEventHandler sharedInstance] sendEvent:eventName eventPayload:eventPayload];
}

+ (void)emitStabilizeEvent:(NSString *)newReleaseHash {
    NSMutableDictionary *eventPayload = [NSMutableDictionary dictionary];
    eventPayload[@"releaseHash"] = newReleaseHash;

  [[StallionEventHandler sharedInstance] sendEvent:StallionObjConstants.stabilized_prod_event eventPayload:eventPayload];
}

@end

