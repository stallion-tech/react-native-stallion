//
//  bspatch_bridge.h
//  react-native-stallion
//
//  Created by Thor963 on 04/11/25.
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
