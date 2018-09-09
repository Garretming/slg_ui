"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentDecorators_1 = require("../../decorators/ComponentDecorators");
var i18n_1 = require("./i18n");
var LabelLocalized = (function (_super) {
    __extends(LabelLocalized, _super);
    function LabelLocalized() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        ComponentDecorators_1.CCProperty({
            default: "TEXT_KEY",
            multiline: true,
            tooltip: "Enter i18n key here",
            notify: function () {
                if (this._sgNode) {
                    this._sgNode.setString(this.string);
                    this._updateNodeSize();
                }
            }
        })
    ], LabelLocalized.prototype, "textKey", void 0);
    __decorate([
        ComponentDecorators_1.CCProperty({
            override: true,
            tooltip: "Here shows the localized string of Text Key",
            get: function () {
                return i18n_1.i18n.t(this.textKey);
            },
            set: function (value) {
                cc.warn("Please set label text key in Text Key property.");
            }
        })
    ], LabelLocalized.prototype, "string", void 0);
    LabelLocalized = __decorate([
        ComponentDecorators_1.CCComponent
    ], LabelLocalized);
    return LabelLocalized;
}(cc.Label));
exports.LabelLocalized = LabelLocalized;
//# sourceMappingURL=LabelLocalized.js.map