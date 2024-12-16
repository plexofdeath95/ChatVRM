import { VRMExpressionManager } from "@pixiv/three-vrm";
import { BLINK_CLOSE_MAX, BLINK_OPEN_MAX } from "./emoteConstants";

/**
 * Class to control automatic blinking
 */
export class AutoBlink {
  private _expressionManager: VRMExpressionManager;
  private _remainingTime: number;
  private _isOpen: boolean;
  private _isAutoBlink: boolean;

  constructor(expressionManager: VRMExpressionManager) {
    this._expressionManager = expressionManager;
    this._remainingTime = 0;
    this._isAutoBlink = true;
    this._isOpen = true;
  }

  /**
   * Enables or disables automatic blinking.
   *
   * When the eyes are closed (blink is 1), applying an emotion expression
   * can look unnatural, so this returns the time until the eyes open.
   * Wait for this duration before applying the emotion expression.
   * @param isAuto Whether to enable automatic blinking
   * @returns Seconds until the eyes open
   */
  public setEnable(isAuto: boolean) {
    this._isAutoBlink = isAuto;

    // If the eyes are closed, return the time until they open
    if (!this._isOpen) {
      return this._remainingTime;
    }

    return 0;
  }

  public update(delta: number) {
    if (this._remainingTime > 0) {
      this._remainingTime -= delta;
      return;
    }

    if (this._isOpen && this._isAutoBlink) {
      this.close();
      return;
    }

    this.open();
  }

  private close() {
    this._isOpen = false;
    this._remainingTime = BLINK_CLOSE_MAX;
    this._expressionManager.setValue("blink", 1);
  }

  private open() {
    this._isOpen = true;
    this._remainingTime = BLINK_OPEN_MAX;
    this._expressionManager.setValue("blink", 0);
  }
}
