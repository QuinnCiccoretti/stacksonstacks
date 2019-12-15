import * as THREE from "three";
import {createCube, printMsg} from 'threeml';
const port = 3000;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

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

animate();

	

var name_to_path:Record<string,string> = {
	"google_compute_instance.vm_instance":"Compute/Compute_Engine",
	"google_compute_network.vpc_network":"Networking/Virtual_Private_Cloud"
}


var path_to_all_icons:string = "img/gcp_icons/";
//return path relative to root dir of a resource icon
function get_iconpath_from_resourcename(name:string): string{
	name = name.trim();
	var iconpath:string = name_to_path[name];
	console.log(name);
	console.log(iconpath);
	if(iconpath && name){
		return path_to_all_icons + iconpath + ".png"
		
	}
	else if(name){
		console.log("Using default icon")
		return path_to_all_icons + "Extras/Generic_GCP" + ".png"
	}
}

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
console.log(terraform_json);
Object.keys(terraform_json).forEach(function(resource_name){
	console.log(resource_name);
	var info:any = terraform_json[resource_name];
	var resourcex:number = parseFloat(info.x);
	var resourcey:number = parseFloat(info.y);
	//stuff for edges I don't yet want to deal with
	// var next = info.next;
	// if(next){
	//   console.log(next);
	//   for(var i = 0; i < next.length; i++){
	//     // connector_list.push([resource_name, next[i]])
	//     console.log(resource_name, next[i]);
	//   }
	// }
	var dot_to_three_scale = 0.02;
	resourcex *= dot_to_three_scale;
	resourcey *= dot_to_three_scale;

	var icon_path:string = get_iconpath_from_resourcename(resource_name);
	createCube(icon_path).then(function(cube){
		console.log(cube);
		cube.position.set(resourcex, resourcey/2+3, resourcey)
		scene.add(cube);
	}).catch((error)=>{
		console.log(error);
	});
})

var gridsize = 30;
var gridHelper = new THREE.GridHelper( gridsize, gridsize );
gridHelper.position.set(0,-1.6,0);
scene.add( gridHelper );


