package com.stallion.storage;

public class StallionMetaConstants {

  // Enum for SwitchState
  public enum SwitchState {
    PROD, STAGE;

    public static SwitchState fromString(String value) {
      try {
        return SwitchState.valueOf(value.toUpperCase());
      } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Invalid SwitchState: " + value);
      }
    }
  }

  // Enum for SlotStates
  public enum SlotStates {
    NEW_SLOT, STABLE_SLOT, DEFAULT_SLOT;

    public static SlotStates fromString(String value) {
      try {
        return SlotStates.valueOf(value.toUpperCase());
      } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Invalid SlotStates: " + value);
      }
    }
  }
}
