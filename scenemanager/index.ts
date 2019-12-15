import * as THREE from "three";
import {createCube} from 'threeml';

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
    return "";
}
export async function initScene(scene: THREE.Scene, terraform_json:any): Promise<any> {
    Object.keys(terraform_json).forEach(function(resource_name){
        var info:any = terraform_json[resource_name];
        var resourcex:number = parseFloat(info.x);
        var resourcey:number = parseFloat(info.y);
        
        var dot_to_three_scale = 0.02;
        resourcex *= dot_to_three_scale;
        resourcey *= dot_to_three_scale;

        var icon_path:string = get_iconpath_from_resourcename(resource_name);
        createCube(icon_path).then(function(cube){
            cube.position.set(resourcex, resourcey/2+3, resourcey)
            scene.add(cube);
        }).catch((error:any)=>{
            console.log(error);
        });
    })

    var gridsize = 30;
    var gridHelper = new THREE.GridHelper( gridsize, gridsize );
    gridHelper.position.set(0,-1.6,0);
    scene.add( gridHelper );

}
