import * as THREE from 'three';
// import WebVRPolyfill from 'webvr-polyfill';
import {SceneManager} from 'scenemanager';
import {isVREnabled, addControls, updateControls} from 'controlmanager';
//make all the objects
var terraform_json:any = {
  "google_compute_instance.vm_instance": {
    "x": "283.23",
    "y": "-158.3",
    "next": [
      "google_compute_network.vpc_network"
    ]
  },
  "google_compute_network.vpc_network": {
    "x": "329.23",
    "y": "-86.3",
    "next": [
      "provider.google"
    ]
  },
  "provider.google": {
    "x": "429.23",
    "y": "-14.3"
  },
  "google_project.my_project": {
    "x": "553.23",
    "y": "-158.3",
    "next": [
      "provider.google"
    ]
  },
  "meta.count-boundary (EachMode fixup)": {
    "x": "224.23",
    "y": "-230.3",
    "next": [
      "google_compute_instance.vm_instance",
      "google_project.my_project"
    ]
  },
  "provider.google (close)": {
    "x": "612.23",
    "y": "-230.3",
    "next": [
      "google_compute_instance.vm_instance",
      "google_project.my_project"
    ]
  },
  "root": {
    "x": "418.23",
    "y": "-302.3",
    "next": [
      "meta.count-boundary (EachMode fixup)",
      "provider.google (close)"
    ]
  }
};

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









