import * as THREE from "three";
export declare function isVREnabled(): boolean;
export declare function updateControls(): void;
export declare function addControls(scene: THREE.Scene, camera: THREE.Camera): Promise<void>;
