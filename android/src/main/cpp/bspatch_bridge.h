//
//  bspatch_bridge.h
//  react-native-stallion
//
//  Bridge header for Android JNI
//

#ifndef BSPATCH_BRIDGE_H
#define BSPATCH_BRIDGE_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// Apply a bsdiff patch file to oldPath, writing the result to newPath.
// Returns 0 on success, negative values on error.
int bspatch_apply(const char *oldPath, const char *newPath, const char *patchPath);

#ifdef __cplusplus
}
#endif

#endif /* BSPATCH_BRIDGE_H */

