//
//  stallion_bspatch_jni.cpp
//  react-native-stallion
//
//  JNI bridge for bspatch functionality
//

#include <jni.h>
#include <string>
#include "bspatch_bridge.h"

extern "C" JNIEXPORT jint JNICALL
Java_com_stallion_utils_StallionBSPatch_nativeApplyPatch(
    JNIEnv *env,
    jobject /* this */,
    jstring oldPath,
    jstring newPath,
    jstring patchPath) {
  
  const char *oldPathStr = env->GetStringUTFChars(oldPath, nullptr);
  const char *newPathStr = env->GetStringUTFChars(newPath, nullptr);
  const char *patchPathStr = env->GetStringUTFChars(patchPath, nullptr);
  
  if (!oldPathStr || !newPathStr || !patchPathStr) {
    if (oldPathStr) env->ReleaseStringUTFChars(oldPath, oldPathStr);
    if (newPathStr) env->ReleaseStringUTFChars(newPath, newPathStr);
    if (patchPathStr) env->ReleaseStringUTFChars(patchPath, patchPathStr);
    return -1;
  }
  
  int result = bspatch_apply(oldPathStr, newPathStr, patchPathStr);
  
  env->ReleaseStringUTFChars(oldPath, oldPathStr);
  env->ReleaseStringUTFChars(newPath, newPathStr);
  env->ReleaseStringUTFChars(patchPath, patchPathStr);
  
  return result;
}

