//
//  StallionObjUtil.m
//  react-native-stallion
//
//  Created by Thor963  on 27/09/24.
//

#import "StallionObjUtil.h"

@implementation StallionObjUtil

static BOOL _isMounted = false;

+ (BOOL)isMounted {
    return _isMounted;
}

+ (void)setIsMounted:(BOOL)isMounted {
    _isMounted = isMounted;
}

@end
