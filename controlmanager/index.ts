import * as THREE from "three";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import WebVRPolyfill from 'webvr-polyfill';
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';

export class ControlManager{
  polyfill:any;
  moveForward:boolean = false;
  moveLeft:boolean = false;
  moveBackward:boolean = false;
  moveRight:boolean = false;
  moveUp:boolean = false;
  moveDown:boolean = false;
  speed:number = 0.1;
  controls:any|PointerLockControls;
  vrEnabled:boolean = false;
  vrDisplay:VRDisplay|null;
  startbutton:HTMLElement;
  fsbutton:HTMLElement;
  blocker:HTMLElement;
  camera: THREE.PerspectiveCamera;
  constructor(camera: THREE.PerspectiveCamera, blocker:HTMLElement,startbutton:HTMLElement, buttonbox:HTMLElement, fsbutton:HTMLElement){
    this.camera = camera;
    this.blocker = blocker;
    this.startbutton = startbutton;
    this.fsbutton = fsbutton;
    this.vrDisplay = null;
    this.polyfill = new WebVRPolyfill();
    document.addEventListener('touchmove', function (e) {
	    e.preventDefault();
	  });
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
    var vert_move = Number( this.moveUp ) - Number( this.moveDown );
    var move_dir = new THREE.Vector3();
  	move_dir.z = Number( this.moveForward ) - Number( this.moveBackward );
  	move_dir.x = Number( this.moveRight ) - Number( this.moveLeft );
  	move_dir.normalize(); // this ensures constant movement speed
  	move_dir.multiplyScalar(this.speed);
    this.camera.position.y += vert_move*this.speed;
  	this.controls.moveRight( move_dir.x );
  	this.controls.moveForward( move_dir.z);
  }

  //set vrenabled and init controls
  async addControls(scene: THREE.Scene, render_dom_elem:HTMLCanvasElement){
    const vrDisplays = await navigator.getVRDisplays();
    // If we have a native display, or we have a CardboardVRDisplay
    // from the polyfill, use it
    this.startbutton.addEventListener( 'click', () => {
        this.blocker.style.display = 'none';
    }, false );
    if (vrDisplays.length) {
    	this.vrEnabled = true;
      this.vrDisplay = vrDisplays[0];
      // Apply VR headset positional data to camera.
      // this.controls = new VRControls(this.camera);
      this.controls = new DeviceOrientationControls(this.camera);
    }
    else {    //we on desktop, get that good good point and shoot
      this.vrEnabled = false;
      this.controls = new PointerLockControls(this.camera,document.body);
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
          case 81:
            this.moveUp = true;
            break;
          case 69:
            this.moveDown = true;
            break;
          case 16:
            this.speed = 0.4;
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
              case 81:
                this.moveUp = false;
                break;
              case 69:
                this.moveDown = false;
                break;
              case 16:
                this.speed = 0.1;
                break;

            }
          };
      document.addEventListener( 'keydown', onKeyDown, false );
      document.addEventListener( 'keyup', onKeyUp, false );

      this.startbutton.addEventListener( 'click', () => {
        this.controls.lock();
      }, false );
      this.fsbutton.addEventListener('click', ()=>{
        this.controls.lock();
        enterFullscreen(render_dom_elem);
      },false);
      this.controls.addEventListener( 'unlock', () =>{
        this.blocker.style.display = 'block';      
      } );

    }
  }
}
//this is junk for x-platform fullscreen
function enterFullscreen (el:any) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}