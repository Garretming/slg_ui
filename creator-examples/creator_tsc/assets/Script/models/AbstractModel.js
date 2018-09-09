"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractModel = (function () {
    function AbstractModel() {
    }
    Object.defineProperty(AbstractModel.prototype, "view", {
        get: function () {
            return this._view;
        },
        set: function (value) {
            this._view = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractModel.prototype, "controller", {
        get: function () {
            return this._controller;
        },
        set: function (value) {
            this._controller = value;
        },
        enumerable: true,
        configurable: true
    });
    return AbstractModel;
}());
exports.AbstractModel = AbstractModel;
//# sourceMappingURL=AbstractModel.js.map