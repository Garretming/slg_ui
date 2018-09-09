"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CCClass1_3_1 = require("./CCClass/CCClass1.3");
var CCClass1_4_1 = require("./CCClass/CCClass1.4");
var define, declareProperties;
if (/^1.4/.test(cc.ENGINE_VERSION)) {
    define = CCClass1_4_1.define;
    declareProperties = CCClass1_4_1.declareProperties;
}
else {
    define = CCClass1_3_1.define;
    declareProperties = CCClass1_3_1.declareProperties;
}
var currentProperties = {};
var currentMixins = {};
var currentEditor = {};
var defined = {};
var definedClass = {};
function getUUID() {
    return cc._RFpeek().uuid;
}
function getScriptName() {
    return cc._RFpeek().script;
}
function CCComponent(constructor) {
    if (constructor.length > 0) {
        cc.warn("Please do not define parameters for a component constructor in " + getScriptName() + "!");
    }
    var uuid = getUUID();
    if (defined[uuid])
        return definedClass[uuid];
    constructor.$super = cc.Component;
    var cls = define(void 0, constructor, currentMixins[uuid], void 0, {});
    var name = cc.js.getClassName(cls);
    declareProperties(cls, name, currentProperties[uuid], constructor, void 0);
    if (currentEditor.hasOwnProperty(uuid)) {
        cc.Component._registerEditorProps(constructor, currentEditor[uuid]);
    }
    currentProperties = {};
    currentMixins = {};
    currentEditor = {};
    defined[uuid] = true;
    definedClass[uuid] = cls;
    return cls;
}
exports.CCComponent = CCComponent;
function CCProperty(option) {
    return function (constructor, propertyName) {
        var uuid = getUUID();
        if (!currentProperties.hasOwnProperty(uuid))
            currentProperties[uuid] = {};
        currentProperties[uuid][propertyName] = option;
    };
}
exports.CCProperty = CCProperty;
function CCEditor(editor) {
    return function (constructor) {
        if (CC_EDITOR) {
            var uuid = getUUID();
            if (!defined.hasOwnProperty(uuid) || !defined[uuid]) {
                currentEditor[uuid] = editor;
            }
            else {
                cc.Component._registerEditorProps(constructor, editor);
            }
        }
        return constructor;
    };
}
exports.CCEditor = CCEditor;
function CCMixins() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return function (cls) {
        var uuid = getUUID();
        if (CC_EDITOR && defined.hasOwnProperty(uuid) && defined[uuid]) {
            cc.error("@CCMixins should be used before @CCComponent in " + getScriptName() + "!");
        }
        currentMixins[uuid] = args;
        return cls;
    };
}
exports.CCMixins = CCMixins;
//# sourceMappingURL=ComponentDecorators.js.map