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
var threeml_1 = require("threeml");
var name_to_path = {
    "google_compute_instance.vm_instance": "Compute/Compute_Engine",
    "google_compute_network.vpc_network": "Networking/Virtual_Private_Cloud"
};
var path_to_all_icons = "img/gcp_icons/";
//return path relative to root dir of a resource icon
function get_iconpath_from_resourcename(name) {
    name = name.trim();
    var iconpath = name_to_path[name];
    console.log(name);
    console.log(iconpath);
    if (iconpath && name) {
        return path_to_all_icons + iconpath + ".png";
    }
    else if (name) {
        console.log("Using default icon");
        return path_to_all_icons + "Extras/Generic_GCP" + ".png";
    }
    return "";
}
function initScene(scene, terraform_json) {
    return __awaiter(this, void 0, void 0, function () {
        var gridsize, gridHelper;
        return __generator(this, function (_a) {
            Object.keys(terraform_json).forEach(function (resource_name) {
                var info = terraform_json[resource_name];
                var resourcex = parseFloat(info.x);
                var resourcey = parseFloat(info.y);
                var dot_to_three_scale = 0.02;
                resourcex *= dot_to_three_scale;
                resourcey *= dot_to_three_scale;
                var icon_path = get_iconpath_from_resourcename(resource_name);
                threeml_1.createCube(icon_path).then(function (cube) {
                    cube.position.set(resourcex, resourcey / 2 + 3, resourcey);
                    scene.add(cube);
                }).catch(function (error) {
                    console.log(error);
                });
            });
            gridsize = 30;
            gridHelper = new THREE.GridHelper(gridsize, gridsize);
            gridHelper.position.set(0, -1.6, 0);
            scene.add(gridHelper);
            return [2 /*return*/];
        });
    });
}
exports.initScene = initScene;