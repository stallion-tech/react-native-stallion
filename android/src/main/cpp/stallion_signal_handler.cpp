#include <jni.h>
#include <signal.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <stdio.h>

static char g_marker_path[512];

static void write_marker(const char* msg) {
  int fd = open(g_marker_path, O_CREAT | O_WRONLY | O_TRUNC, 0600);
  if (fd >= 0) {
    (void)write(fd, msg, strlen(msg));
    close(fd);
  }
}

static void stallion_signal_handler(int sig) {
  char buf[64];
  int n = snprintf(buf, sizeof(buf), "signal=%d\n", sig);
  (void)n;
  write_marker(buf);
  signal(sig, SIG_DFL);
  raise(sig);
}

extern "C"
JNIEXPORT void JNICALL
Java_com_stallion_utils_StallionExceptionHandler_initNativeSignalHandler(
  JNIEnv* env, jclass, jstring filesDir) {
  const char* path = env->GetStringUTFChars(filesDir, nullptr);
  snprintf(g_marker_path, sizeof(g_marker_path), "%s/%s", path, "stallion_crash.marker");
  env->ReleaseStringUTFChars(filesDir, path);

  signal(SIGABRT, stallion_signal_handler);
  signal(SIGSEGV, stallion_signal_handler);
  signal(SIGILL,  stallion_signal_handler);
  signal(SIGBUS,  stallion_signal_handler);
  signal(SIGFPE,  stallion_signal_handler);
}
