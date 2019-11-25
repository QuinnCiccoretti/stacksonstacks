"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const threeml_1 = require("threeml");
const port = 3000;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;
var animate = function () {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
};
animate();
// app.get('/', (req, res) => res.send(printMsg()));
// app.listen(port, () => console.log(`Example app listening on port ${port}!`));
threeml_1.createCube("https://immersiveatuva.github.io/img/vr.png").then(function (cube) {
    console.log(cube);
    // cube.position.set()
    scene.add(cube);
}).catch((error) => {
    console.log("XXXX");
    console.log(error);
});
//# sourceMappingURL=index.js.map