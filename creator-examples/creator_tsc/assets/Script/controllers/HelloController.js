"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractController_1 = require("./AbstractController");
var HelloModel_1 = require("../models/HelloModel");
var HelloController = (function (_super) {
    __extends(HelloController, _super);
    function HelloController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HelloController.prototype.init = function (view) {
        this.view = view;
        this.model = new HelloModel_1.HelloModel();
        this.hello();
    };
    HelloController.prototype.hello = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ipResult, ipInfoResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.model.getIP()];
                    case 1:
                        ipResult = _a.sent();
                        this.view.updateIP(ipResult);
                        if (!(ipResult.code == 0 && ipResult.data !== null)) return [3, 3];
                        return [4, this.model.getIPInfo(ipResult.data.ip)];
                    case 2:
                        ipInfoResult = _a.sent();
                        this.view.updateIPInfo(ipInfoResult);
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    return HelloController;
}(AbstractController_1.AbstractController));
exports.HelloController = HelloController;
//# sourceMappingURL=HelloController.js.map