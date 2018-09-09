"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentDecorators_1 = require("../decorators/ComponentDecorators");
var AbstractSimpleComponent_1 = require("./AbstractSimpleComponent");
var AbstractComponent = (function (_super) {
    __extends(AbstractComponent, _super);
    function AbstractComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(AbstractComponent.prototype, "model", {
        get: function () {
            return this._model;
        },
        set: function (value) {
            this._model = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractComponent.prototype, "controller", {
        get: function () {
            return this._controller;
        },
        set: function (value) {
            this._controller = value;
        },
        enumerable: true,
        configurable: true
    });
    AbstractComponent = __decorate([
        ComponentDecorators_1.CCComponent
    ], AbstractComponent);
    return AbstractComponent;
}(AbstractSimpleComponent_1.AbstractSimpleComponent));
exports.AbstractComponent = AbstractComponent;
//# sourceMappingURL=AbstractComponent.js.map