"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ComponentDecorators_1 = require("../decorators/ComponentDecorators");
var AbstractComponent_1 = require("./AbstractComponent");
var HelloController_1 = require("../controllers/HelloController");
var HelloView = (function (_super) {
    __extends(HelloView, _super);
    function HelloView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HelloView.prototype.onLoad = function () {
        this.initLabels();
        this.controller = new HelloController_1.HelloController();
        this.controller.init(this);
        this.move10();
    };
    HelloView.prototype.initLabels = function () {
        this.ipLabel.string = "正在加载IP...";
        this.countryLabel.string = "";
        this.cityLabel.string = "";
        this.countyLabel.string = "";
    };
    HelloView.prototype.updateIP = function (res) {
        if (res.code == 0 && res.data !== null) {
            this.ipLabel.string = res.data.ip;
            this.countryLabel.string = "正在加载国家信息";
            this.cityLabel.string = "正在加载城市信息";
            this.countyLabel.string = "正在加载区域信息";
        }
        else {
            this.ipLabel.string = "获取IP失败";
        }
    };
    HelloView.prototype.updateIPInfo = function (res) {
        if (res.code == 0 && res.data !== null) {
            this.countryLabel.string = res.data.country;
            this.cityLabel.string = res.data.city;
            this.countyLabel.string = res.data.county;
        }
        else {
            this.countryLabel.string = "加载国家信息失败";
            this.cityLabel.string = "加载城市信息失败";
            this.countyLabel.string = "加载区域信息失败";
        }
    };
    HelloView.prototype.move10 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 10)) return [3, 4];
                        return [4, this.asyncRunAction(this.ipLabel.node, cc.sequence(cc.moveBy(0.5, -10, 0), cc.moveBy(0.5, 10, 0)))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    };
    HelloView.prototype.asyncRunAction = function (node, action) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        node.runAction(cc.sequence(action, cc.callFunc(resolve)));
                    })];
            });
        });
    };
    __decorate([
        ComponentDecorators_1.CCProperty(cc.Label)
    ], HelloView.prototype, "ipLabel", void 0);
    __decorate([
        ComponentDecorators_1.CCProperty(cc.Label)
    ], HelloView.prototype, "countryLabel", void 0);
    __decorate([
        ComponentDecorators_1.CCProperty(cc.Label)
    ], HelloView.prototype, "cityLabel", void 0);
    __decorate([
        ComponentDecorators_1.CCProperty(cc.Label)
    ], HelloView.prototype, "countyLabel", void 0);
    HelloView = __decorate([
        ComponentDecorators_1.CCEditor({
            executeInEditMode: true
        }),
        ComponentDecorators_1.CCComponent
    ], HelloView);
    return HelloView;
}(AbstractComponent_1.AbstractComponent));
exports.HelloView = HelloView;
//# sourceMappingURL=HelloView.js.map