import * as THREE from "three";
import {NodeCube} from "threeml";
var raycaster = new THREE.Raycaster();
var selected_cube:any|null = null;
var onMouseDown:EventListener;
var onMouseUp:EventListener;
var colorRed = new THREE.Color(0xff0000);
var colorBlue = new THREE.Color(0x0000ff);

export class DragDropManager{
	hitmarker:THREE.Group;
	camera: THREE.Camera;
	scene:THREE.Scene;
	obj_list:NodeCube[];

	constructor(scene:THREE.Scene,camera:THREE.Camera){
		this.scene = scene;
		this.camera = camera;
		this.obj_list = [];
		this.hitmarker = this.makeHitmarker();
	}

	getIntersections() {
	  var cam_mat = new THREE.Matrix4();
	  cam_mat.identity().extractRotation(this.camera.matrixWorld );
	  raycaster.ray.origin.setFromMatrixPosition(this.camera.matrixWorld);
	  raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( cam_mat );
	  return raycaster.intersectObjects( this.obj_list );
	}

	setupRaycasting(obj_list:NodeCube[]){
		this.obj_list = obj_list;
		document.body.removeEventListener('mousedown',onMouseDown);
		document.body.removeEventListener( 'mouseup', onMouseUp);
		// actually onclick lmao
		
		onMouseDown = ()=>{
		  var intersections = this.getIntersections();
		  if ( intersections.length > 0 ) {
		  	this.camera.add(this.hitmarker);
		    var intersection = intersections[ 0 ];
		    var tempMatrix = new THREE.Matrix4();
		    tempMatrix.getInverse( this.camera.matrixWorld );
		    var object = intersection.object;
		    changeConnectedArrowColor(object, colorBlue);
		    object.matrix.premultiply( tempMatrix );
		    object.matrix.decompose( object.position, object.quaternion, object.scale );
		    selected_cube = object;
		    this.camera.add( object );
		  }
		}
		// actually onmouseup lmao
		onMouseUp = ()=>{
		  if ( selected_cube ) {
		  	this.camera.remove(this.hitmarker);
		  	changeConnectedArrowColor(selected_cube, colorRed);
		    var object = selected_cube;
		    selected_cube = null;
		    object.matrix.premultiply( this.camera.matrixWorld );
		    object.matrix.decompose( object.position, object.quaternion, object.scale );

		    this.camera.remove(object);  //remove from camera
		    this.scene.add(object);  //add back to scene
		  }
		}

		document.body.addEventListener( 'mousedown', onMouseDown, false );
		document.body.addEventListener( 'mouseup', onMouseUp, false );
	}


	
	
	makeHitmarker():THREE.Group {
		var hitmarker = new THREE.Group();
		var lineMat = new THREE.LineBasicMaterial({color:0x0, linewidth:4});

		var line_geom1 = new THREE.BufferGeometry();
		var line_geom2 = new THREE.BufferGeometry();
		var line_geom3 = new THREE.BufferGeometry();
		var line_geom4 = new THREE.BufferGeometry();
		const xhairsz = 0.004;
		var vertices = new Float32Array([-xhairsz*2.2,xhairsz*2.2,0,-xhairsz*1.5, xhairsz*1.5,0]);
		line_geom1.setAttribute('position', new THREE.BufferAttribute(vertices,3));
		var segment = new THREE.Line(line_geom1, lineMat);
		hitmarker.add(segment);
		var vertices = new Float32Array([xhairsz*2.2,xhairsz*2.2,0,xhairsz*1.5, xhairsz*1.5,0]);
		line_geom2.setAttribute('position', new THREE.BufferAttribute(vertices,3));
		var segment = new THREE.Line(line_geom2, lineMat);
		hitmarker.add(segment);
		var vertices = new Float32Array([xhairsz*2.2,-xhairsz*2.2,0,xhairsz*1.5, -xhairsz*1.5,0]);
		line_geom3.setAttribute('position', new THREE.BufferAttribute(vertices,3));
		var segment = new THREE.Line(line_geom3, lineMat);
		hitmarker.add(segment);
		var vertices = new Float32Array([-xhairsz*2.2,-xhairsz*2.2,0,-xhairsz*1.5, -xhairsz*1.5,0]);
		line_geom4.setAttribute('position', new THREE.BufferAttribute(vertices,3));
		var segment = new THREE.Line(line_geom4, lineMat);
		hitmarker.add(segment);
		hitmarker.position.z = -0.5;
		return hitmarker;
	}

	function changeConnectedArrowColor(cube:any, color:THREE.Color){
		var arrows_in = cube.arrows_in;
		var arrows_out = cube.arrows_out;
		if(arrows_in){
			for(var arrow of arrows_in){
				arrow.setColor(color);
			}
		}
		if(arrows_out){
			for(var arrow of arrows_out){
				arrow.setColor(color);
			}
		}
	}
	export function updateSelectedArrows(camera:THREE.Camera){
		if(selected_cube){
			if(selected_cube.label){
				selected_cube.label.lookAt(camera.position);
			}
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
}