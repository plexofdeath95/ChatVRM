import { VRMHumanoid, VRMLookAt, VRMLookAtApplier } from "@pixiv/three-vrm";
import * as THREE from "three";

/** Minimum interval before a saccade can occur */
const SACCADE_MIN_INTERVAL = 0.5;

/** Probability of a saccade occurring */
const SACCADE_PROC = 0.05;

/** Radius of the saccade range in degrees. Larger than actual eyeball movement for visual effect. */
const SACCADE_RADIUS = 5.0;

const _v3A = new THREE.Vector3();
const _quatA = new THREE.Quaternion();
const _eulerA = new THREE.Euler();

/**
 * Extends `VRMLookAt` with the following features:
 *
 * - If `userTarget` is assigned, smoothly looks towards the user's direction
 * - Rotates the head in addition to the eyes
 * - Adds saccadic eye movement
 */
export class VRMLookAtSmoother extends VRMLookAt {
  /** Smoothing factor */
  public smoothFactor = 4.0;

  /** Maximum angle to look towards the user in degrees */
  public userLimitAngle = 90.0;

  /** Direction towards the user. The original `target` is reserved for animation use. */
  public userTarget?: THREE.Object3D | null;

  /** Disables saccade when set to `false` */
  public enableSaccade: boolean;

  /** Stores the yaw direction of the saccade */
  private _saccadeYaw = 0.0;

  /** Stores the pitch direction of the saccade */
  private _saccadePitch = 0.0;

  /** Timer to determine when the next saccade should occur */
  private _saccadeTimer = 0.0;

  /** Smoothed yaw */
  private _yawDamped = 0.0;

  /** Smoothed pitch */
  private _pitchDamped = 0.0;

  /** Temporarily stores the rotation of the first person bone */
  private _tempFirstPersonBoneQuat = new THREE.Quaternion();

  public constructor(humanoid: VRMHumanoid, applier: VRMLookAtApplier) {
    super(humanoid, applier);
    this.enableSaccade = true;
  }

  public update(delta: number): void {
    if (this.target && this.autoUpdate) {
      // Update `_yaw` and `_pitch` based on the animation target
      this.lookAt(this.target.getWorldPosition(_v3A));

      const yawAnimation = this._yaw; // Yaw specified by the animation
      const pitchAnimation = this._pitch; // Pitch specified by the animation

      let yawFrame = yawAnimation;
      let pitchFrame = pitchAnimation;

      // Looking towards the user
      if (this.userTarget) {
        this.lookAt(this.userTarget.getWorldPosition(_v3A));

        // Limit angles; fallback to animation if exceeding `userLimitAngle`
        if (
          this.userLimitAngle < Math.abs(this._yaw) ||
          this.userLimitAngle < Math.abs(this._pitch)
        ) {
          this._yaw = yawAnimation;
          this._pitch = pitchAnimation;
        }

        // Smooth yawDamped and pitchDamped
        const k = 1.0 - Math.exp(-this.smoothFactor * delta);
        this._yawDamped += (this._yaw - this._yawDamped) * k;
        this._pitchDamped += (this._pitch - this._pitchDamped) * k;

        // Blend animation with user direction
        const userRatio =
          1.0 -
          THREE.MathUtils.smoothstep(
            Math.sqrt(
              yawAnimation * yawAnimation + pitchAnimation * pitchAnimation
            ),
            30.0,
            90.0
          );

        yawFrame = THREE.MathUtils.lerp(
          yawAnimation,
          0.6 * this._yawDamped,
          userRatio
        );
        pitchFrame = THREE.MathUtils.lerp(
          pitchAnimation,
          0.6 * this._pitchDamped,
          userRatio
        );

        // Rotate the head
        _eulerA.set(
          -this._pitchDamped * THREE.MathUtils.DEG2RAD,
          this._yawDamped * THREE.MathUtils.DEG2RAD,
          0.0,
          VRMLookAt.EULER_ORDER
        );
        _quatA.setFromEuler(_eulerA);

        const head = this.humanoid.getRawBoneNode("head")!;
        this._tempFirstPersonBoneQuat.copy(head.quaternion);
        head.quaternion.slerp(_quatA, 0.4);
        head.updateMatrixWorld();
      }

      if (this.enableSaccade) {
        // Calculate saccade direction
        if (
          SACCADE_MIN_INTERVAL < this._saccadeTimer &&
          Math.random() < SACCADE_PROC
        ) {
          this._saccadeYaw = (2.0 * Math.random() - 1.0) * SACCADE_RADIUS;
          this._saccadePitch = (2.0 * Math.random() - 1.0) * SACCADE_RADIUS;
          this._saccadeTimer = 0.0;
        }

        this._saccadeTimer += delta;

        // Add saccade movement
        yawFrame += this._saccadeYaw;
        pitchFrame += this._saccadePitch;

        // Apply saccade to the applier
        this.applier.applyYawPitch(yawFrame, pitchFrame);
      }

      // No further updates required this frame
      this._needsUpdate = false;
    }

    // When `target` does not control lookAt
    if (this._needsUpdate) {
      this._needsUpdate = false;
      this.applier.applyYawPitch(this._yaw, this._pitch);
    }
  }

  /** Reverts the head rotation after rendering */
  public revertFirstPersonBoneQuat(): void {
    if (this.userTarget) {
      const head = this.humanoid.getNormalizedBoneNode("head")!;
      head.quaternion.copy(this._tempFirstPersonBoneQuat);
    }
  }
}
