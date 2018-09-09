"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentDecorators_1 = require("../decorators/ComponentDecorators");
var AbstractSimpleComponent = (function (_super) {
    __extends(AbstractSimpleComponent, _super);
    function AbstractSimpleComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractSimpleComponent = __decorate([
        ComponentDecorators_1.CCComponent
    ], AbstractSimpleComponent);
    return AbstractSimpleComponent;
}(cc.Component));
exports.AbstractSimpleComponent = AbstractSimpleComponent;
//# sourceMappingURL=AbstractSimpleComponent.js.map