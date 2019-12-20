import * as THREE from "three";
const loader = promisifyLoader(new THREE.TextureLoader());

export async function createCube(url: string): Promise<THREE.Mesh> {
	var texture = await loader.load(url);
	var scalefactor: number = 1;
  var h = texture.image.height;
  var w = texture.image.width;

  var geometry: THREE.Geometry = new THREE.BoxGeometry(1, 1, 1);
  
  // uniforms
  var uniforms = {
      color: { type: "c", value: new THREE.Color( 0x004fd1 ) }, // material is "red"
      texture: { type: "t", value: texture },
  };

  // material. we need shaders since we use pngs for backgrounds
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader()
  });

  var mesh:THREE.Mesh = new THREE.Mesh(geometry, material);
  mesh.name = url;
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
  loader.setCrossOrigin('anonymous');
  return {
    originalLoader: loader,
    load: promiseLoader,
  };

}

function fragmentShader():string{
  return  `
  uniform vec3 color;
  uniform sampler2D texture;
  varying vec2 vUv;
  void main() {
      vec4 tColor = texture2D( texture, vUv );
      
      gl_FragColor = vec4( mix( color, tColor.rgb, tColor.a ), 1.0 );
      
  }
  `;
}
function vertexShader():string{
  return `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      
  }
  `
}