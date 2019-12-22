import { Mesh, Object3D, ArrowHelper } from 'three';
export declare class NodeCube extends Object3D {
    constructor(mesh: Mesh);
    arrows_in: ArrowHelper[];
    arrows_out: ArrowHelper[];
    edges_in: NodeCube[];
    edges_out: NodeCube[];
}
