"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var three_1 = require("three");
var NodeCube = /** @class */ (function (_super) {
    __extends(NodeCube, _super);
    function NodeCube(mesh) {
        var _this = _super.call(this) || this;
        _this.position.copy(mesh.position);
        mesh.position = new three_1.Vector3();
        _this.add(mesh);
        _this.arrows_in = [];
        _this.arrows_out = [];
        _this.edges_in = [];
        _this.edges_out = [];
        return _this;
    }
    return NodeCube;
}(three_1.Object3D));
exports.NodeCube = NodeCube;
