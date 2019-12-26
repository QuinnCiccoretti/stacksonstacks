import * as THREE from "three";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import WebVRPolyfill from 'webvr-polyfill';
import VRControls from 'three-vrcontrols-module';

export class ControlManager{
  polyfill:any;
  moveForward:boolean = false;
  moveLeft:boolean = false;
  moveBackward:boolean = false;
  moveRight:boolean = false;
  controls:any|PointerLockControls;
  vrEnabled:boolean = false;
  vrDisplay:VRDisplay|null;
  constructor(){
    this.vrDisplay = null;
    this.polyfill = new WebVRPolyfill();
  }

  updateControls():void {
  	if(this.vrEnabled){
  		this.updateVRControls();
  	}
  	else{
  		this.updateDesktopControls();
  	}

  }

  updateVRControls(): void {
  	this.controls.update();	
  }
  updateDesktopControls(): void {
  	var move_dir = new THREE.Vector3()
  	move_dir.z = Number( this.moveForward ) - Number( this.moveBackward );
  	move_dir.x = Number( this.moveRight ) - Number( this.moveLeft );
  	move_dir.normalize(); // this ensures consistent movements in all directions
  	move_dir.divideScalar(10);
  	this.controls.moveRight( move_dir.x );
  	this.controls.moveForward( move_dir.z);
  }

  //set vrenabled and init controls
  async addControls(scene: THREE.Scene, camera: THREE.Camera, blocker: HTMLElement, startbutton:HTMLElement){
    const vrDisplays = await navigator.getVRDisplays();
    // If we have a native display, or we have a CardboardVRDisplay
    // from the polyfill, use it
    if (vrDisplays.length) {
    	this.vrEnabled = true;
      this.vrDisplay = vrDisplays[0];
      // Apply VR headset positional data to camera.
      this.controls = new VRControls(camera);
    }
    else {    //we on desktop, get that good good point and shoot
      this.vrEnabled = false;
      this.controls = new PointerLockControls(camera,document.body);
      console.log("added pointerlock document with blocker");
      scene.add(this.controls.getObject());
      var onKeyDown = ( event:KeyboardEvent)=>{
          
          switch ( event.keyCode ) {
          case 38: // up
          case 87: // w
            this.moveForward = true;
            break;
          case 37: // left
          case 65: // a
            this.moveLeft = true;
            break;
          case 40: // down
          case 83: // s
            this.moveBackward = true;
            break;
          case 39: // right
          case 68: // d
            this.moveRight = true;
            break;
          }
         
      };
      var onKeyUp = ( event:KeyboardEvent )=>{
            switch ( event.keyCode ) {
              case 38: // up
              case 87: // w
                this.moveForward = false;
                break;
              case 37: // left
              case 65: // a
                this.moveLeft = false;
                break;
              case 40: // down
              case 83: // s
                this.moveBackward = false;
                break;
              case 39: // right
              case 68: // d
                this.moveRight = false;
                break;
            }
          };
      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );

      startbutton.addEventListener( 'click', () => {
        this.controls.lock();
      }, false );
      this.controls.addEventListener( 'lock', () =>{
        blocker.style.display = 'none';
      } );
      this.controls.addEventListener( 'unlock', () =>{
        blocker.style.display = 'block';      
      } );

    }
  }
}