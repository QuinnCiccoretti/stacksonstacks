import * as THREE from "three";
import {TDSLoader} from 'three/examples/jsm/loaders/TDSLoader.js';


export async function createPortalGun(resourcepath:string, modelpath:string, normalpath:string): Promise<THREE.Group>{
	var tloader = promisifyTextureLoader(new THREE.TextureLoader());
	var normal = await tloader.load( normalpath );
	const tdsloader = promisifyTDSLoader(new TDSLoader());
  tdsloader.originalLoader.setResourcePath(resourcepath);
  
	var group = await tdsloader.load(modelpath);
	group.traverse( ( child:any) => {
		if ( child.isMesh ) {
			child.material.normalMap = normal;
		}
	} );
	return group;
}

// Big thx to lewy blue for showing how to wrap loader in promises
// https://blackthread.io/blog/promisifying-threejs-loaders/
function promisifyTDSLoader ( loader: TDSLoader) {

  function promiseLoader ( url: string): Promise<THREE.Group> {

    return new Promise( ( resolve, reject ) => {

      loader.load( url, resolve, undefined, reject );

    } );
  }
  loader.setCrossOrigin('anonymous');
  return {
    originalLoader: loader,
    load: promiseLoader,
  };

}
function promisifyTextureLoader ( loader: THREE.TextureLoader ) {

  function promiseLoader ( url: string): Promise<THREE.Texture> {

    return new Promise( ( resolve, reject ) => {

      loader.load( url, resolve, reject );

    } );
  }
  loader.setCrossOrigin('anonymous');
  return {
    originalLoader: loader,
    load: promiseLoader,
  };

}