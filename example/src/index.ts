import * as THREE from 'three';
import {SceneManager} from 'scenemanager';
import {ControlManager} from 'controlmanager';
import {parseDotOutput} from 'terra-parse';

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls:any;
var vrDisplay:VRDisplay;
var scene:SceneManager|null;

var renderButton = document.getElementById("renderButton");
renderButton.addEventListener("click",renderCubes);

scene = new SceneManager();
var color1picker = document.getElementById("color1");
color1picker.addEventListener("change", function(event:any){
  var color = event.target.value;
  scene.updateSkyColor(color);
});
var color2picker = document.getElementById("color2");
color2picker.addEventListener("change", function(event:any){
  var color = event.target.value;
  scene.updateGroundColor(color);
});
//locate the ui elements
var vrButton = document.getElementById('vr');
var fullscreenButton = document.getElementById('fullscreen');
var startbutton = document.getElementById("startButton");  
var blocker = document.getElementById("blocker");
var control_manager = new ControlManager(blocker, startbutton, vrButton, fullscreenButton);



//add controls
control_manager.addControls(scene, scene.camera, renderer.domElement).then(
	function(){
  	if(control_manager.vrEnabled){
      vrDisplay = control_manager.vrDisplay;
  		vrDisplay.requestAnimationFrame(vrAnimate);
  	}
  	else{
  		requestAnimationFrame(desktopAnimate);
  	}
  }
).catch(function(error){
	console.log(error);
});

function renderCubes(){
  //make all the objects
  var text = (<HTMLInputElement>document.getElementById('textbox')).value;
  var terraform_json:any = parseDotOutput(text);
  scene.make_cubes(terraform_json);
}

renderCubes();

function vrAnimate(){
	control_manager.updateControls();
  scene.updateScene();
	vrDisplay.requestAnimationFrame(vrAnimate);
  renderer.render( scene, scene.camera );
}

function desktopAnimate(){
  control_manager.updateControls();
  scene.updateScene();
	requestAnimationFrame(desktopAnimate);
  renderer.render( scene, scene.camera );
}
