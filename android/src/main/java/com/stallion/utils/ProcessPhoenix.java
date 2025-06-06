package com.stallion.utils;

import static android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK;
import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Process;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Process Phoenix facilitates restarting your application process. This should only be used for
 * things like fundamental state changes in your debug builds (e.g., changing from staging to
 * production).
 * <p>
 * Trigger process recreation by calling {@link #triggerRebirth} with a {@link Context} instance.
 */
public final class ProcessPhoenix extends Activity {
    private static final String KEY_RESTART_INTENTS = "phoenix_restart_intents";
    private static final String KEY_MAIN_PROCESS_PID = "phoenix_main_process_pid";

    /**
     * Call to restart the application process using the {@linkplain Intent#CATEGORY_DEFAULT default}
     * activity as an intent.
     * <p>
     * Behavior of the current process after invoking this method is undefined.
     */
    public static void triggerRebirth(Context context) {
        triggerRebirth(context, getRestartIntent(context));
    }

    /**
     * Call to restart the application process using the specified intents.
     * <p>
     * Behavior of the current process after invoking this method is undefined.
     */
    public static void triggerRebirth(Context context, Intent... nextIntents) {
        if (nextIntents.length < 1) {
            throw new IllegalArgumentException("intents cannot be empty");
        }
        // create a new task for the first activity.
        nextIntents[0].addFlags(FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK);

        Intent intent = new Intent(context, ProcessPhoenix.class);
        intent.addFlags(FLAG_ACTIVITY_NEW_TASK); // In case we are called with non-Activity context.
        intent.putParcelableArrayListExtra(KEY_RESTART_INTENTS, new ArrayList<>(Arrays.asList(nextIntents)));
        intent.putExtra(KEY_MAIN_PROCESS_PID, Process.myPid());
        context.startActivity(intent);
    }

    private static Intent getRestartIntent(Context context) {
        String packageName = context.getPackageName();
        Intent defaultIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
        if (defaultIntent != null) {
            return defaultIntent;
        }

        throw new IllegalStateException("Unable to determine default activity for "
                + packageName
                + ". Does an activity specify the DEFAULT category in its intent filter?");
    }

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Process.killProcess(getIntent().getIntExtra(KEY_MAIN_PROCESS_PID, -1)); // Kill original main process

        ArrayList<Intent> intents = getIntent().getParcelableArrayListExtra(KEY_RESTART_INTENTS);
        startActivities(intents.toArray(new Intent[intents.size()]));
        finish();
        Runtime.getRuntime().exit(0); // Kill kill kill!
    }

    /**
     * Checks if the current process is a temporary Phoenix Process.
     * This can be used to avoid initialisation of unused resources or to prevent running code that
     * is not multi-process ready.
     *
     * @return true if the current process is a temporary Phoenix Process
     */
    public static boolean isPhoenixProcess(Context context) {
        int currentPid = Process.myPid();
        ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> runningProcesses = manager.getRunningAppProcesses();
        if (runningProcesses != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : runningProcesses) {
                if (processInfo.pid == currentPid && processInfo.processName.endsWith(":phoenix")) {
                    return true;
                }
            }
        }
        return false;
    }
}
