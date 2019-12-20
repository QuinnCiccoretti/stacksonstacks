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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var PointerLockControls_js_1 = require("three/examples/jsm/controls/PointerLockControls.js");
var webvr_polyfill_1 = __importDefault(require("webvr-polyfill"));
var three_vrcontrols_module_1 = __importDefault(require("three-vrcontrols-module"));
var polyfill = new webvr_polyfill_1.default();
var moveForward = false;
var moveLeft = false;
var moveBackward = false;
var moveRight = false;
var controls;
var vrEnabled = false;
function isVREnabled() {
    return vrEnabled;
}
exports.isVREnabled = isVREnabled;
function updateControls() {
    if (vrEnabled) {
        updateVRControls();
    }
    else {
        updateDesktopControls();
    }
}
exports.updateControls = updateControls;
function updateVRControls() {
    controls.update();
}
function updateDesktopControls() {
    var move_dir = new THREE.Vector3();
    move_dir.z = Number(moveForward) - Number(moveBackward);
    move_dir.x = Number(moveRight) - Number(moveLeft);
    move_dir.normalize(); // this ensures consistent movements in all directions
    move_dir.divideScalar(10);
    controls.moveRight(move_dir.x);
    controls.moveForward(move_dir.z);
}
//set vrenabled and init controls
function addControls(scene, camera, blocker, startbutton) {
    return __awaiter(this, void 0, void 0, function () {
        var vrDisplays, vrDisplay, onKeyDown, onKeyUp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.getVRDisplays()];
                case 1:
                    vrDisplays = _a.sent();
                    // If we have a native display, or we have a CardboardVRDisplay
                    // from the polyfill, use it
                    if (vrDisplays.length) {
                        vrEnabled = true;
                        vrDisplay = vrDisplays[0];
                        // Apply VR headset positional data to camera.
                        controls = new three_vrcontrols_module_1.default(camera);
                    }
                    else { //we on desktop, get that good good point and shoot
                        vrEnabled = false;
                        controls = new PointerLockControls_js_1.PointerLockControls(camera, document.body);
                        console.log("added pointerlock document with blocker");
                        scene.add(controls.getObject());
                        onKeyDown = function (event) {
                            switch (event.keyCode) {
                                case 38: // up
                                case 87: // w
                                    moveForward = true;
                                    break;
                                case 37: // left
                                case 65: // a
                                    moveLeft = true;
                                    break;
                                case 40: // down
                                case 83: // s
                                    moveBackward = true;
                                    break;
                                case 39: // right
                                case 68: // d
                                    moveRight = true;
                                    break;
                            }
                        };
                        onKeyUp = function (event) {
                            switch (event.keyCode) {
                                case 38: // up
                                case 87: // w
                                    moveForward = false;
                                    break;
                                case 37: // left
                                case 65: // a
                                    moveLeft = false;
                                    break;
                                case 40: // down
                                case 83: // s
                                    moveBackward = false;
                                    break;
                                case 39: // right
                                case 68: // d
                                    moveRight = false;
                                    break;
                            }
                        };
                        document.addEventListener('keydown', onKeyDown, false);
                        document.addEventListener('keyup', onKeyUp, false);
                        startbutton.addEventListener('click', function () {
                            controls.lock();
                        }, false);
                        controls.addEventListener('lock', function () {
                            blocker.style.display = 'none';
                        });
                        controls.addEventListener('unlock', function () {
                            blocker.style.display = 'block';
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.addControls = addControls;
