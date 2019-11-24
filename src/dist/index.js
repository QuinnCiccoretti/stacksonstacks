"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
function printMsg() {
    console.log(new THREE.Vector3(0, 1, 0));
    return "This is a new three-enabled messo from the for dummies of npm";
}
exports.printMsg = printMsg;
