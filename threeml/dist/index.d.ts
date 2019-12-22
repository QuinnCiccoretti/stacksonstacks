import * as THREE from "three";
export declare class NodeCube extends THREE.Mesh {
    constructor(geometry: THREE.Geometry, material: THREE.Material);
    arrows_in: THREE.ArrowHelper[];
    arrows_out: THREE.ArrowHelper[];
    edges_in: NodeCube[];
    edges_out: NodeCube[];
}
export declare function createCube(url: string): Promise<NodeCube>;
