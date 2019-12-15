import * as THREE from "three";
export declare function vrEnabled(): Promise<boolean>;
export declare function updateControls(controls: any): void;
export declare function addControls(controls: any, scene: THREE.Scene, camera: THREE.Camera): Promise<any>;
