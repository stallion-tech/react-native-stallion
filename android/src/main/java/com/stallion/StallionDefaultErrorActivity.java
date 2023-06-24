package com.stallion;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;

public class StallionDefaultErrorActivity extends Activity {
  private TextView stackTraceView;
  private Button continueButton;
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Log.d("StallionDefault", "StallionDefaultErrorActivity");
    String receivedStackTrace = getIntent().getExtras().getString("stack_trace_string");
    String stackTraceString = receivedStackTrace != null ? receivedStackTrace : "null";
    setContentView(R.layout.stallion_default_error_activity);
    stackTraceView = findViewById(R.id.seb_stack_trace_text_view);
    stackTraceView.setText(stackTraceString);
    continueButton = findViewById(R.id.seb_continue_button);
    continueButton.setOnClickListener(view -> continueExceptionFlow());
  }
  private void continueExceptionFlow() {
    StallionModule.continueExcetionFlow();
  }
}
