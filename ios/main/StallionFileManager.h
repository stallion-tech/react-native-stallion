//
//  StallionFileManager.h
//  react-native-stallion
//
//  Created by Thor963 on 29/01/25.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface StallionFileManager : NSObject

+ (void)deleteFileOrFolderSilently:(NSString *)filePath;
+ (void)moveFileFrom:(NSString *)fromPath to:(NSString *)toPath;
+ (void)copyFileOrDirectoryFrom:(NSString *)sourcePath to:(NSString *)destinationPath;

@end

NS_ASSUME_NONNULL_END
