import * as THREE from "three";
const loader = promisifyLoader(new THREE.TextureLoader());
export function printMsg() : string {
	return "This is a new three-enabled messo from the for dummies of npm";
}
export async function createCube(url: string): Promise<any> {
	console.log("We doing it big");
	var texture = await loader.load(url);
	console.log(texture);
	console.log("I get it how I live it");
	var scalefactor: number = 1;
	var texture1 = texture;
    var h = texture.image.height;
    var w = texture.image.width;

    var geometry: THREE.Geometry = new THREE.BoxGeometry(1, 1, 1);
    var material:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide});
    var mesh:THREE.Mesh = new THREE.Mesh(geometry, material);

    // set the position of the image mesh in the x,y,z dimensions
    mesh.name = url;
    // mesh.position.add(pos);
    // mesh.lookAt(0,0,0);
    // mesh.userData.redirect = redirect;
    // mesh.userData.url = url;
    // scene.add(mesh);
    // draggable_obj_list.push(mesh);
    console.log(mesh);
    return mesh;
}
// Big thx to lewy blue for showing how to wrap loader in promises
// https://blackthread.io/blog/promisifying-threejs-loaders/
function promisifyLoader ( loader: THREE.TextureLoader ) {

  function promiseLoader ( url: string): Promise<THREE.Texture> {

    return new Promise( ( resolve, reject ) => {

      loader.load( url, resolve, reject );

    } );
  }

  return {
    originalLoader: loader,
    load: promiseLoader,
  };

}