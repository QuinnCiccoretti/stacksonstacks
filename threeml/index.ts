import * as THREE from "three";

const loader = promisifyLoader(new THREE.TextureLoader());

export class NodeCube extends THREE.Mesh{
  constructor(geometry:THREE.Geometry, material:THREE.Material){
    super(geometry, material);
    this.arrows_in = [];
    this.arrows_out = [];
    this.edges_in = [];
    this.edges_out = [];
  }
  arrows_in:THREE.ArrowHelper[];
  arrows_out:THREE.ArrowHelper[];
  edges_in:NodeCube[];
  edges_out:NodeCube[];
}
// export class TextCreator{
// 	font: THREE.Font|null;
// 	constructor(){
// 		this.font = null;
// 		console.log("I am here");
// 		loadFont('fonts/font.fnt', (err:any, font:any) =>{
// 			if(err){
// 				console.log(err);
// 			}
// 			else{
// 				this.font = font;
// 				console.log(font);
// 			}
// 		})
// 	}
// 	async createTextMesh(text:string):Promise<THREE.Mesh>{
// 		console.log(this.font);
// 		console.log("YYYYYYY");
// 		var texture = await loader.load('fonts/font.fnt');
// 		var geometry = createGeometry({
// 			font:this.font,
// 			text: text
// 		});
// 		var material = new THREE.MeshBasicMaterial({
// 			map:texture,
// 			side: THREE.DoubleSide,
// 			transparent: true
// 		});
// 		var mesh = new THREE.Mesh(geometry, material);
// 		return mesh;
// 	}
// }
export async function createCube(url: string): Promise<NodeCube> {
	var texture = await loader.load(url);
	var scalefactor: number = 1;
	var h = texture.image.height;
	var w = texture.image.width;

	var geometry: THREE.Geometry = new THREE.BoxGeometry(1, 1, 1);

	// uniforms
	var uniforms = {
	  color: { type: "c", value: new THREE.Color( 0xd1d1d1 ) }, // material is "red"
	  texture: { type: "t", value: texture },
	};

	// material. we need shaders since we use pngs for backgrounds
	var material = new THREE.ShaderMaterial({
	uniforms: uniforms,
	vertexShader: vertexShader(),
	fragmentShader: fragmentShader()
	});

	// var mesh:THREE.Mesh = new THREE.Mesh(geometry, material);
	var nodecube = new NodeCube(geometry, material);
  nodecube.name = url;
	nodecube.castShadow = true;
	nodecube.receiveShadow = true;
	
	return nodecube;

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