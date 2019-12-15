import * as THREE from "three";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import WebVRPolyfill from 'webvr-polyfill';
import VRControls from 'three-vrcontrols-module';
const polyfill = new WebVRPolyfill();

export async function vrEnabled():Promise<boolean>{
    const vrDisplays = await navigator.getVRDisplays();
    return vrDisplays.length != 0;
}

export async function addControls(controls: any, scene: THREE.Scene, camera: THREE.Camera): Promise<any>{
  const vrDisplays = await navigator.getVRDisplays();
  // If we have a native display, or we have a CardboardVRDisplay
  // from the polyfill, use it
  if (vrDisplays.length) {
    var vrDisplay = vrDisplays[0];

    // Apply VR headset positional data to camera.
    controls = new VRControls(camera);
    return vrDisplay;
  }
  else {    //we on desktop, get that good good point and shoot
    controls = new PointerLockControls(camera);
    scene.add(controls.getObject());
    var onKeyDown = function ( event:KeyboardEvent) {
        var moveForward, moveLeft, moveBackward, moveRight:boolean = false;
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
        var move_dir = new THREE.Vector3();
        move_dir.z = Number( moveForward ) - Number( moveBackward );
        move_dir.x = Number( moveRight ) - Number( moveLeft );
        move_dir.normalize(); // this ensures consistent movements in all directions
        move_dir.divideScalar(100);
        console.log(move_dir);
        controls.moveRight( move_dir.x );
        controls.moveForward( move_dir.z);
    };
    document.addEventListener( 'keydown', onKeyDown, false );
  }
}