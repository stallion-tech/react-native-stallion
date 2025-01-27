package com.stallion.storage;

import org.json.JSONException;
import org.json.JSONObject;

public class StallionMeta {

  private StallionMetaConstants.SwitchState switchState;
  private StallionMetaConstants.SlotStates currentProdSlot;
  private StallionMetaConstants.SlotStates currentStageSlot;
  private String stageTempHash;
  private String stageNewHash;
  private String prodTempHash;
  private String prodNewHash;
  private String prodStableHash;
  private String lastRolledBackHash;

  public StallionMeta() {
    this.reset();
  }

  public void reset() {
    this.switchState = StallionMetaConstants.SwitchState.PROD;
    this.currentProdSlot = StallionMetaConstants.SlotStates.DEFAULT_SLOT;
    this.currentStageSlot = StallionMetaConstants.SlotStates.DEFAULT_SLOT;
    this.stageTempHash = "";
    this.stageNewHash = "";
    this.prodTempHash = "";
    this.prodNewHash = "";
    this.prodStableHash = "";
    this.lastRolledBackHash = "";
  }

  // Getters and Setters

  public StallionMetaConstants.SwitchState getSwitchState() {
    return switchState;
  }

  public void setSwitchState(StallionMetaConstants.SwitchState switchState) {
    this.switchState = switchState;
  }

  public StallionMetaConstants.SlotStates getCurrentProdSlot() {
    return currentProdSlot;
  }

  public String getHashAtCurrentProdSlot() {
    switch (this.currentProdSlot) {
      case NEW_SLOT:
        return this.prodNewHash;
      case STABLE_SLOT:
        return this.prodStableHash;
      default: return "";
    }
  }

  public String getActiveReleaseHash() {
    if(!this.prodTempHash.isEmpty()) {
      return this.prodNewHash;
    }
    switch (this.currentProdSlot) {
      case NEW_SLOT:
        return this.prodNewHash;
      case STABLE_SLOT:
        return this.prodStableHash;
      default: return "";
    }
  }

  public void setCurrentProdSlot(StallionMetaConstants.SlotStates currentProdSlot) {
    this.currentProdSlot = currentProdSlot;
  }

  public StallionMetaConstants.SlotStates getCurrentStageSlot() {
    return currentStageSlot;
  }

  public void setCurrentStageSlot(StallionMetaConstants.SlotStates currentStageSlot) {
    this.currentStageSlot = currentStageSlot;
  }

  public String getStageTempHash() {
    return stageTempHash;
  }

  public void setStageTempHash(String stageTempHash) {
    this.stageTempHash = stageTempHash;
  }

  public String getStageNewHash() {
    return stageNewHash;
  }

  public void setStageNewHash(String stageNewHash) {
    this.stageNewHash = stageNewHash;
  }

  public String getProdTempHash() {
    return prodTempHash;
  }

  public void setProdTempHash(String prodTempHash) {
    this.prodTempHash = prodTempHash;
  }

  public String getProdNewHash() {
    return prodNewHash;
  }

  public void setProdNewHash(String prodNewHash) {
    this.prodNewHash = prodNewHash;
  }

  public String getProdStableHash() {
    return prodStableHash;
  }

  public void setProdStableHash(String prodStableHash) {
    this.prodStableHash = prodStableHash;
  }

  public String getLastRolledBackHash() {
    return lastRolledBackHash;
  }

  public void setLastRolledBackHash(String lastRolledBackHash) {
    this.lastRolledBackHash = lastRolledBackHash;
  }

  // Convert to JSON
  public JSONObject toJSON() {
    JSONObject metaJson = new JSONObject();
    try {
      metaJson.put("switchState", switchState.name());

      JSONObject stageJson = new JSONObject();
      stageJson.put("newHash", stageNewHash);
      stageJson.put("tempHash", stageTempHash);
      stageJson.put("currentSlot", currentStageSlot.name());
      metaJson.put("stageSlot", stageJson);

      JSONObject prodJson = new JSONObject();
      prodJson.put("newHash", prodNewHash);
      prodJson.put("tempHash", prodTempHash);
      prodJson.put("stableHash", prodStableHash);
      prodJson.put("currentSlot", currentProdSlot.name());
      metaJson.put("prodSlot", prodJson);

      metaJson.put("lastRolledBackHash", lastRolledBackHash);

    } catch (JSONException e) {
      return new JSONObject();
    }
    return metaJson;
  }

  // Create object from JSON
  public static StallionMeta fromJSON(JSONObject jsonObject) {
    StallionMeta stallionMeta = new StallionMeta();
    try {
      stallionMeta.setSwitchState(
        StallionMetaConstants.SwitchState.fromString(
          jsonObject.optString(
            "switchState",
            ""
          )
        )
      );

      stallionMeta.setLastRolledBackHash(jsonObject.optString("lastRolledBackHash", ""));

      JSONObject stageJson = jsonObject.optJSONObject("stageSlot");
      if(stageJson != null) {
        stallionMeta.setStageNewHash(stageJson.optString("newHash",""));
        stallionMeta.setStageTempHash(stageJson.optString("tempHash", ""));
        stallionMeta.setCurrentStageSlot(
          StallionMetaConstants.SlotStates.fromString(
            stageJson.optString(
              "currentSlot",
              ""
            )
          )
        );
      }

      JSONObject prodJson = jsonObject.optJSONObject("prodSlot");
      if(prodJson != null) {
        stallionMeta.setProdNewHash(prodJson.optString("newHash",""));
        stallionMeta.setProdTempHash(prodJson.optString("tempHash", ""));
        stallionMeta.setProdStableHash(prodJson.optString("stableHash", ""));
        stallionMeta.setCurrentProdSlot(
          StallionMetaConstants.SlotStates.fromString(
            prodJson.optString(
              "currentSlot",
              ""
            )
          )
        );
      }
      return stallionMeta;
    } catch (Exception e) {
      return stallionMeta;
    }
  }
}
