import * as THREE from "three";
const loader = promisifyLoader(new THREE.TextureLoader());
const fontloader = promisifyFontLoader(new THREE.FontLoader());

export class TextCreator{
	font: THREE.Font|null;
	constructor(){
		this.font = null;
		this.initFont();
		var loader = new THREE.FontLoader();
		var geometry;
		
	}
	async initFont(){
		var font = await fontloader.load( 'res/VT323_Regular.json');
		this.font = font;
		console.log(this.font);
	}
	async createTextMesh(text:string,textsize:number, ht:number):Promise<THREE.Mesh>{
		if(!this.font){
			await this.initFont();
		}
		var text_geometry = new THREE.TextGeometry( text, {
			font: <THREE.Font>this.font,	//the already loaded font
			size: textsize,
			height: ht,
			curveSegments: 1,
			bevelEnabled: false
		} );
		var text_material = new THREE.MeshBasicMaterial({color: 0x0});
		var text_mesh = new THREE.Mesh( text_geometry, text_material);
		return text_mesh;		
	}
	
}

// var text_creator = new TextCreator();

export class NodeCube extends THREE.Mesh{
  constructor(geometry:THREE.Geometry, material:THREE.Material, name:string){
    super(geometry, material);
    this.name = name;
    this.arrows_in = [];
    this.arrows_out = [];
    this.edges_in = [];
    this.edges_out = [];
    this.label = null;
  }

  arrows_in:THREE.ArrowHelper[];
  arrows_out:THREE.ArrowHelper[];
  edges_in:NodeCube[];
  edges_out:NodeCube[];
  label:THREE.Mesh|null;
}

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
	var nodecube = new NodeCube(geometry, material, url);
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

function promisifyFontLoader ( loader: THREE.FontLoader ) {
  function promiseLoader ( url: string): Promise<THREE.Font> {
    return new Promise( ( resolve, reject ) => {
      loader.load( url, resolve, function(){},reject );
    } );
  }
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