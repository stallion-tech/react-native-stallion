#include <jni.h>
#include <signal.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <stdio.h>

static char g_marker_path[512];
static char g_mount_marker_path[512];

// Async-signal-safe function to check if mount marker exists
static int is_mounted() {
  int fd = open(g_mount_marker_path, O_RDONLY);
  if (fd >= 0) {
    close(fd);
    return 1; // Mounted
  }
  return 0; // Not mounted
}

// Async-signal-safe JSON writing (minimal JSON for crash marker)
static void write_crash_marker_json(int signal, int mounted) {
  int fd = open(g_marker_path, O_CREAT | O_WRONLY | O_TRUNC, 0600);
  if (fd >= 0) {
    // Write JSON: {"signal":X,"isAutoRollback":true/false,"crashLog":"signal=X\n"}
    // isAutoRollback = !mounted (auto rollback if not mounted)
    int autoRollback = !mounted;
    char json[512];
    int len = snprintf(json, sizeof(json),
      "{\"signal\":%d,\"isAutoRollback\":%s,\"crashLog\":\"signal=%d\\n\"}",
      signal, autoRollback ? "true" : "false", signal);
    if (len > 0 && len < (int)sizeof(json)) {
      (void)write(fd, json, len);
    }
    close(fd);
  }
}

static void stallion_signal_handler(int sig) {
  // Read mount state at crash time (async-signal-safe)
  int mounted = is_mounted();
  // Write JSON marker with crash info and autoRollback flag
  write_crash_marker_json(sig, mounted);
  signal(sig, SIG_DFL);
  raise(sig);
}

extern "C"
JNIEXPORT void JNICALL
Java_com_stallion_utils_StallionExceptionHandler_initNativeSignalHandler(
  JNIEnv* env, jclass, jstring filesDir) {
  const char* path = env->GetStringUTFChars(filesDir, nullptr);
  snprintf(g_marker_path, sizeof(g_marker_path), "%s/%s", path, "stallion_crash.marker");
  snprintf(g_mount_marker_path, sizeof(g_mount_marker_path), "%s/%s", path, "stallion_mount.marker");
  env->ReleaseStringUTFChars(filesDir, path);

  signal(SIGABRT, stallion_signal_handler);
  signal(SIGSEGV, stallion_signal_handler);
  signal(SIGILL,  stallion_signal_handler);
  signal(SIGBUS,  stallion_signal_handler);
  signal(SIGFPE,  stallion_signal_handler);
}
