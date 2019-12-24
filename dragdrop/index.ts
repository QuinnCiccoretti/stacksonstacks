import * as THREE from "three";
import {NodeCube} from "threeml";
var raycaster = new THREE.Raycaster();
var selected_cube:any|null = null;
var onMouseDown:EventListener;
var onMouseUp:EventListener;

export function setupRaycasting(camera:THREE.Camera, scene:THREE.Scene, obj_list:NodeCube[]){
document.body.removeEventListener('mousedown',onMouseDown);
document.body.removeEventListener( 'mouseup', onMouseUp);
// actually onclick lmao
function getIntersections() {
  var cam_mat = new THREE.Matrix4();
  cam_mat.identity().extractRotation(camera.matrixWorld );
  raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
  raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( cam_mat );
  return raycaster.intersectObjects( obj_list );
}
onMouseDown = function(){
  var intersections = getIntersections();
  if ( intersections.length > 0 ) {
    var intersection = intersections[ 0 ];
    var tempMatrix = new THREE.Matrix4();
    tempMatrix.getInverse( camera.matrixWorld );
    var object = intersection.object;

    object.matrix.premultiply( tempMatrix );
    object.matrix.decompose( object.position, object.quaternion, object.scale );
    selected_cube = object;
    camera.add( object );
  }
}
// actually onmouseup lmao
onMouseUp = function(){
  if ( selected_cube ) {
    var object = selected_cube;
    selected_cube = null;
    object.matrix.premultiply( camera.matrixWorld );
    object.matrix.decompose( object.position, object.quaternion, object.scale );

    camera.remove(object);  //remove from camera
    scene.add(object);  //add back to scene
  }
}

document.body.addEventListener( 'mousedown', onMouseDown, false );
document.body.addEventListener( 'mouseup', onMouseUp, false );
}
export function updateSelectedArrows(camera:THREE.Camera){
	if(selected_cube){
		//we need the lists
		var cam_pos = camera.position;
		if(!selected_cube.arrows_in){
			return;
		}
		var arrows_in = selected_cube.arrows_in;
		var arrows_out = selected_cube.arrows_out;
		var edges_in = selected_cube.edges_in;
		var edges_out = selected_cube.edges_out;
		const cone_l = 0.5;

		for(var i = 0; i < arrows_in.length; i++){
			var arrow = arrows_in[i];
			var dest1 = new THREE.Vector3();
			selected_cube.getWorldPosition(dest1);
			// var dest = selected_cube.position.clone().add(cam_pos);
			var start1 = edges_in[i].position;
			var direction = dest1.sub(start1);
			arrow.setLength(direction.length()-cone_l,cone_l,cone_l/2);
			arrow.setDirection(direction.normalize());
		}
		for(var i = 0; i < arrows_out.length; i++){
			var arrow = arrows_out[i];
			var start2 = new THREE.Vector3();
			selected_cube.getWorldPosition(start2);
			var dest2 = edges_out[i].position;
			var dir = dest2.clone().sub(start2);
			arrow.setLength(dir.length()-cone_l,cone_l,cone_l/2);
			arrow.setDirection(dir.normalize());
			arrow.position.copy(start2);
		}
	}
}