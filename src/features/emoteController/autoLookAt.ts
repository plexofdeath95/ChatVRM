import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";

/**
 * Class to control eye movement.
 *
 * Saccades are handled within VRMLookAtSmoother, so if larger eye movements
 * are required, implement them here.
 */
export class AutoLookAt {
  private _lookAtTarget: THREE.Object3D;

  constructor(vrm: VRM, camera: THREE.Object3D) {
    this._lookAtTarget = new THREE.Object3D();
    camera.add(this._lookAtTarget);

    if (vrm.lookAt) vrm.lookAt.target = this._lookAtTarget;
  }
}
