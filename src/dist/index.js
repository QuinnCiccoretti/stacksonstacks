"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var loader = promisifyLoader(new THREE.TextureLoader());
function printMsg() {
    return "This is a new three-enabled messo from the for dummies of npm";
}
exports.printMsg = printMsg;
function createCube(url) {
    return __awaiter(this, void 0, void 0, function () {
        var texture, scalefactor, texture1, h, w, geometry, material, mesh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("We doing it big");
                    return [4 /*yield*/, loader.load(url)];
                case 1:
                    texture = _a.sent();
                    console.log(texture);
                    console.log("I get it how I live it");
                    scalefactor = 1;
                    texture1 = texture;
                    h = texture.image.height;
                    w = texture.image.width;
                    geometry = new THREE.BoxGeometry(1, 1, 1);
                    material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
                    mesh = new THREE.Mesh(geometry, material);
                    // set the position of the image mesh in the x,y,z dimensions
                    mesh.name = url;
                    // mesh.position.add(pos);
                    // mesh.lookAt(0,0,0);
                    // mesh.userData.redirect = redirect;
                    // mesh.userData.url = url;
                    // scene.add(mesh);
                    // draggable_obj_list.push(mesh);
                    console.log(mesh);
                    return [2 /*return*/, mesh];
            }
        });
    });
}
exports.createCube = createCube;
// Big thx to lewy blue for showing how to wrap loader in promises
// https://blackthread.io/blog/promisifying-threejs-loaders/
function promisifyLoader(loader) {
    function promiseLoader(url) {
        return new Promise(function (resolve, reject) {
            loader.load(url, resolve, reject);
        });
    }
    return {
        originalLoader: loader,
        load: promiseLoader,
    };
}
