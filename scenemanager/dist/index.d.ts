import * as THREE from "three";
export declare function updateScene(camera: THREE.Camera): void;
export declare function initScene(camera: THREE.Camera, scene: THREE.Scene, terraform_json: any): Promise<any>;
export declare function updateSkyColor(scene: THREE.Scene, color: string): void;
export declare function updateGroundColor(color: string): void;
