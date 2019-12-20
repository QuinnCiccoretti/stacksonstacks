import * as THREE from 'three';
// import WebVRPolyfill from 'webvr-polyfill';
import {initScene, updateScene, updateSkyColor} from 'scenemanager';
import {isVREnabled, addControls, updateControls} from 'controlmanager';

var scene = new THREE.Scene();
var color1picker = document.getElementById("color1");
color1picker.addEventListener("change", function(event:any){
  console.log(event);
  var color = event.target.value;
  updateSkyColor(scene, color);
});

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

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

initScene(camera,scene, terraform_json);
var controls:any;
var vrDisplay:any;
var blocker = document.getElementById("blocker");
var startbutton = document.getElementById("startButton");
addControls(scene, camera, blocker,startbutton).then(
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

var color1picker = document.getElementById("color1");
color1picker.addEventListener("change", function(event:any){
  console.log(event);
  var color = event.target.value;
  updateSkyColor(scene, color);
});

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function vrAnimate(){
	updateControls();
  updateScene(camera);
	vrDisplay.requestAnimationFrame(vrAnimate);
  renderer.render( scene, camera );

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}

function desktopAnimate(){
  updateControls();
  updateScene(camera);
	requestAnimationFrame(desktopAnimate);
  renderer.render( scene, camera );

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}









