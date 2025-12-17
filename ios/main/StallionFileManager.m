//
//  StallionFileManager.m
//  react-native-stallion
//
//  Created by Thor963 on 29/01/25.
//
#import "StallionFileManager.h"

@implementation StallionFileManager

+ (void)deleteFileOrFolderSilently:(NSString *)filePath {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;
    BOOL isDirectory = NO;

    if ([fileManager fileExistsAtPath:filePath isDirectory:&isDirectory]) {
        if (isDirectory) {
            NSArray *contents = [fileManager contentsOfDirectoryAtPath:filePath error:&error];
            if (error) {
                NSLog(@"Failed to list contents of directory: %@", error.localizedDescription);
                return;
            }
            for (NSString *content in contents) {
                NSString *fullPath = [filePath stringByAppendingPathComponent:content];
                [self deleteFileOrFolderSilently:fullPath];
            }
        }
        if (![fileManager removeItemAtPath:filePath error:&error]) {
            NSLog(@"Failed to delete file or folder: %@", error.localizedDescription);
        }
    }
}

+ (void)moveFileFrom:(NSString *)fromPath to:(NSString *)toPath {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;

    // Ensure destination directory exists
    NSString *destinationDirectory = [toPath stringByDeletingLastPathComponent];
    if (![fileManager fileExistsAtPath:destinationDirectory]) {
        if (![fileManager createDirectoryAtPath:destinationDirectory
                     withIntermediateDirectories:YES
                                      attributes:nil
                                           error:&error]) {
            NSLog(@"Failed to create destination directory: %@", error.localizedDescription);
            return;
        }
    }

    // Attempt to move the file
    if ([fileManager fileExistsAtPath:toPath]) {
        [self deleteFileOrFolderSilently:toPath];
    }

    if (![fileManager moveItemAtPath:fromPath toPath:toPath error:&error]) {
        NSLog(@"Failed to move file: %@", error.localizedDescription);
        // Fallback: Copy the file and delete the original
        [self copyFileOrDirectoryFrom:fromPath to:toPath];
        [self deleteFileOrFolderSilently:fromPath];
    }
}

+ (void)copyFileOrDirectoryFrom:(NSString *)sourcePath to:(NSString *)destinationPath {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;

    BOOL isDirectory = NO;
    if (![fileManager fileExistsAtPath:sourcePath isDirectory:&isDirectory]) {
        NSLog(@"Source does not exist: %@", sourcePath);
        return;
    }

    if (isDirectory) {
        // Copy directory recursively
        [self copyDirectoryFrom:sourcePath to:destinationPath];
    } else {
        // Copy individual file
        if (![fileManager copyItemAtPath:sourcePath toPath:destinationPath error:&error]) {
            NSLog(@"Failed to copy file: %@", error.localizedDescription);
        }
    }
}

#pragma mark - Private Helper Methods

+ (void)copyDirectoryFrom:(NSString *)sourceDirectory to:(NSString *)destinationDirectory {
    NSFileManager *fileManager = [NSFileManager defaultManager];
    NSError *error = nil;

    // Ensure destination directory exists
    if (![fileManager fileExistsAtPath:destinationDirectory]) {
        if (![fileManager createDirectoryAtPath:destinationDirectory
                     withIntermediateDirectories:YES
                                      attributes:nil
                                           error:&error]) {
            NSLog(@"Failed to create destination directory: %@", error.localizedDescription);
            return;
        }
    }

    NSArray *contents = [fileManager contentsOfDirectoryAtPath:sourceDirectory error:&error];
    if (error) {
        NSLog(@"Failed to list contents of directory: %@", error.localizedDescription);
        return;
    }

    for (NSString *content in contents) {
        NSString *sourcePath = [sourceDirectory stringByAppendingPathComponent:content];
        NSString *destinationPath = [destinationDirectory stringByAppendingPathComponent:content];
        BOOL isDirectory = NO;

        if ([fileManager fileExistsAtPath:sourcePath isDirectory:&isDirectory]) {
            if (isDirectory) {
                // Recursively copy subdirectories
                [self copyDirectoryFrom:sourcePath to:destinationPath];
            } else {
                // Copy individual file
                if (![fileManager copyItemAtPath:sourcePath toPath:destinationPath error:&error]) {
                    NSLog(@"Failed to copy file: %@", error.localizedDescription);
                }
            }
        }
    }
}

@end
