import * as THREE from 'three';
// import WebVRPolyfill from 'webvr-polyfill';
import {SceneManager} from 'scenemanager';
import {isVREnabled, addControls, updateControls} from 'controlmanager';
import {parseDotOutput} from 'terra-parse';
//make all the objects
var terraform_json:any = parseDotOutput();
console.log(terraform_json);

var scene = new SceneManager(terraform_json);
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

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls:any;
var vrDisplay:any;
var blocker = document.getElementById("blocker");
var startbutton = document.getElementById("startButton");
addControls(scene, scene.camera, blocker,startbutton).then(
	function(){
  	if(isVREnabled()){
  		vrDisplay.requestAnimationFrame(vrAnimate);
  	}
  	else{
  		requestAnimationFrame(desktopAnimate);
  	}
  }
).catch(function(error){
	console.log(error);
});



function vrAnimate(){
	updateControls();
  scene.updateScene();
	vrDisplay.requestAnimationFrame(vrAnimate);
  renderer.render( scene, scene.camera );
}

function desktopAnimate(){
  updateControls();
  scene.updateScene();
	requestAnimationFrame(desktopAnimate);
  renderer.render( scene, scene.camera );
}









