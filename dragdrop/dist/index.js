"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var raycaster = new THREE.Raycaster();
var selected_cube = null;
function setupRaycasting(camera, scene, obj_list) {
    // actually onclick lmao
    function getIntersections() {
        var cam_mat = new THREE.Matrix4();
        cam_mat.identity().extractRotation(camera.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(cam_mat);
        return raycaster.intersectObjects(obj_list);
    }
    var onMouseDown = function () {
        var intersections = getIntersections();
        if (intersections.length > 0) {
            var intersection = intersections[0];
            var tempMatrix = new THREE.Matrix4();
            tempMatrix.getInverse(camera.matrixWorld);
            var object = intersection.object;
            object.matrix.premultiply(tempMatrix);
            object.matrix.decompose(object.position, object.quaternion, object.scale);
            selected_cube = object;
            camera.add(object);
        }
    };
    // actually onmouseup lmao
    var onMouseUp = function () {
        if (selected_cube) {
            var object = selected_cube;
            selected_cube = null;
            object.matrix.premultiply(camera.matrixWorld);
            object.matrix.decompose(object.position, object.quaternion, object.scale);
            camera.remove(object); //remove from camera
            scene.add(object); //add back to scene
        }
    };
    document.body.addEventListener('mousedown', onMouseDown, false);
    document.body.addEventListener('mouseup', onMouseUp, false);
}
exports.setupRaycasting = setupRaycasting;
function updateSelectedArrows() {
    if (selected_cube) {
        //we need the lists
        var arrows_in = selected_cube.userData.arrows_in;
        var arrows_out = selected_cube.userData.arrows_out;
        var edges_in = selected_cube.userData.edges_in;
        var edges_out = selected_cube.userData.edges_out;
        for (var i = 0; i < arrows_in.length; i++) {
            var arrow = arrows_in[i];
            var dest = selected_cube.position;
            var start = edges_in[i].position;
            var direction = dest.clone().sub(start);
            arrow.setLength(direction.length());
            arrow.setDirection(direction.normalize());
        }
        for (var i = 0; i < arrows_out.length; i++) {
            var arrow = arrows_in[i];
            var s = selected_cube.position;
            var d = edges_out[i].position;
            var dir = d.clone().sub(s);
            arrow.setLength(dir.length());
            arrow.setDirection(dir.normalize());
            arrow.position.set(s);
        }
    }
}
exports.updateSelectedArrows = updateSelectedArrows;
