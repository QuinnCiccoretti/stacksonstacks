import * as THREE from "three";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import WebVRPolyfill from 'webvr-polyfill';
import VRControls from 'three-vrcontrols-module';

const polyfill = new WebVRPolyfill();
var moveForward:boolean = false;
var moveLeft:boolean = false;
var moveBackward:boolean = false;
var moveRight:boolean = false;
var controls:any;
var vrEnabled:boolean = false;

export function isVREnabled():boolean{
	return vrEnabled;
}

export function updateControls():void {
	if(vrEnabled){
		updateVRControls();
	}
	else{
		updateDesktopControls();
	}

}

function updateVRControls(): void {
	controls.update();	
}
function updateDesktopControls(): void {
	var move_dir = new THREE.Vector3()
	move_dir.z = Number( moveForward ) - Number( moveBackward );
	move_dir.x = Number( moveRight ) - Number( moveLeft );
	move_dir.normalize(); // this ensures consistent movements in all directions
	move_dir.divideScalar(10);
	controls.moveRight( move_dir.x );
	controls.moveForward( move_dir.z);
}

//set vrenabled and init controls
export async function addControls(scene: THREE.Scene, camera: THREE.Camera): Promise<void>{
  const vrDisplays = await navigator.getVRDisplays();
  // If we have a native display, or we have a CardboardVRDisplay
  // from the polyfill, use it
  if (vrDisplays.length) {
  	vrEnabled = true;
    var vrDisplay = vrDisplays[0];
    // Apply VR headset positional data to camera.
    controls = new VRControls(camera);
  }
  else {    //we on desktop, get that good good point and shoot
    vrEnabled = false;
    controls = new PointerLockControls(camera);
    scene.add(controls.getObject());
    var onKeyDown = function ( event:KeyboardEvent):void{
        
        switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          moveForward = true;
          break;
        case 37: // left
        case 65: // a
          moveLeft = true;
          break;
        case 40: // down
        case 83: // s
          moveBackward = true;
          break;
        case 39: // right
        case 68: // d
          moveRight = true;
          break;
        }
       
    };
    var onKeyUp = function ( event:KeyboardEvent ):void{
          switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
              moveForward = false;
              break;
            case 37: // left
            case 65: // a
              moveLeft = false;
              break;
            case 40: // down
            case 83: // s
              moveBackward = false;
              break;
            case 39: // right
            case 68: // d
              moveRight = false;
              break;
          }
        };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
  }
}