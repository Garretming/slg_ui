"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zh_1 = require("./data/zh");
var Polyglot = require("polyglot");
var language = zh_1.zh;
var polyglot = new Polyglot({ phrases: language });
exports.i18n = {
    init: function (language) {
        var data = require(language);
        polyglot.replace(data);
    },
    t: function (key, opt) {
        return polyglot.t(key, opt);
    }
};
//# sourceMappingURL=i18n.js.map