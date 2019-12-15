import * as THREE from 'three';
// import WebVRPolyfill from 'webvr-polyfill';
import {initScene} from 'scenemanager';
import {vrEnabled, addControls} from 'controlmanager';


var scene = new THREE.Scene();
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

initScene(scene, terraform_json);
var controls:any;
var vrDisplay:any;
addControls(controls, scene, camera).then(
	function(potential_display){
		vrEnabled().then(function(result){
			if(result){
				vrDisplay = potential_display;
				vrDisplay.requestAnimationFrame(vrAnimate);
			}
			else{
				requestAnimationFrame(normalAnimate);
			}
		});
	}
	
).catch(function(error){
	console.log(error);
});

function vrAnimate(){
	controls.update();
	vrDisplay.requestAnimationFrame(vrAnimate);
}

function normalAnimate(){
	requestAnimationFrame(normalAnimate);
}

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var animate = function () {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );
};







