package com.stallion.utils;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import com.stallion.R;

import java.util.Objects;

public class StallionErrorActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    String receivedStackTrace = Objects.requireNonNull(getIntent().getExtras()).getString("stack_trace_string");
    String stackTraceString = receivedStackTrace != null ? receivedStackTrace : "null";
    setContentView(R.layout.stallion_default_error_activity);
    TextView stackTraceView = findViewById(R.id.seb_stack_trace_text_view);
    stackTraceView.setText(stackTraceString);
    Button continueButton = findViewById(R.id.seb_continue_button);
    continueButton.setOnClickListener(view -> continueExceptionFlow());
  }
  private void continueExceptionFlow() {
    StallionExceptionHandler.continueExceptionFlow();
  }
}

