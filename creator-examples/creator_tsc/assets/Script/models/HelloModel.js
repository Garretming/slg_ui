"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractModel_1 = require("./AbstractModel");
var HelloModel = (function (_super) {
    __extends(HelloModel, _super);
    function HelloModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.serverAddress = "http://52.58.118.63";
        return _this;
    }
    HelloModel.prototype.getIP = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4, fetch(this.serverAddress + "/getIP.php")];
                    case 1:
                        res = _a.sent();
                        return [4, res.json()];
                    case 2: return [2, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        cc.log(e_1);
                        return [2, { code: 1, data: null }];
                    case 4: return [2];
                }
            });
        });
    };
    HelloModel.prototype.getIPInfo = function (ip) {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4, fetch(this.serverAddress + "/getIPInfo.php?ip=" + ip)];
                    case 1:
                        res = _a.sent();
                        return [4, res.json()];
                    case 2: return [2, _a.sent()];
                    case 3:
                        e_2 = _a.sent();
                        cc.log(e_2);
                        return [2, { code: 2, data: null }];
                    case 4: return [2];
                }
            });
        });
    };
    return HelloModel;
}(AbstractModel_1.AbstractModel));
exports.HelloModel = HelloModel;
//# sourceMappingURL=HelloModel.js.map