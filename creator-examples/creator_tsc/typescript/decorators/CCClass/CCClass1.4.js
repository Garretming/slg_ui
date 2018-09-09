/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Chukong Aipu reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var JS = cc.js;
var Enum = cc.Enum;
var _isPlainEmptyObj_DEV = function (obj) {
    if (!obj || obj.constructor !== Object) {
        return false;
    }
    // jshint ignore: start
    for (var k in obj) {
        return false;
    }
    // jshint ignore: end
    return true;
};
var _cloneable_DEV = function (obj) {
    return obj && typeof obj.clone === 'function' &&
        (obj.constructor.prototype.hasOwnProperty('clone') || obj.hasOwnProperty('clone'));
};
var Attr = cc.Class.Attr;
var getTypeChecker = Attr.getTypeChecker;
var SerializableAttrs = {
    url: {
        canUsedInGet: true
    },
    default: {},
    serializable: {},
    editorOnly: {},
    rawType: {},
};

// 预处理 notify 等扩展属性
function parseNotify (val, propName, notify, properties) {
    if (val.get || val.set) {
        if (CC_DEV) {
            cc.warn('"notify" can\'t work with "get/set" !');
        }
        return;
    }
    if (val.hasOwnProperty('default')) {
        // 添加新的内部属性，将原来的属性修改为 getter/setter 形式
        // 以 _ 开头将自动设置property 为 visible: false
        var newKey = "_N$" + propName;

        val.get = function () {
            return this[newKey];
        };
        val.set = function (value) {
            var oldValue = this[newKey];
            this[newKey] = value;
            notify.call(this, oldValue);
        };

        var newValue = {};
        properties[newKey] = newValue;
        // 将不能用于get方法中的属性移动到newValue中
        for (var attr in SerializableAttrs) {
            var v = SerializableAttrs[attr];
            if (val.hasOwnProperty(attr)) {
                newValue[attr] = val[attr];
                if (!v.canUsedInGet) {
                    delete val[attr];
                }
            }
        }
    }
    else if (CC_DEV) {
        cc.warn('"notify" must work with "default" !');
    }
}

function checkUrl (val, className, propName, url) {
    if (Array.isArray(url)) {
        if (url.length > 0) {
            url = url[0];
        }
        else if (CC_EDITOR) {
            return cc.error('Invalid url of %s.%s', className, propName);
        }
    }
    if (CC_EDITOR) {
        if (url == null) {
            return cc.warn('The "url" attribute of "%s.%s" is undefined when loading script.', className, propName);
        }
        if (typeof url !== 'function' || !cc.isChildClassOf(url, cc.RawAsset)) {
            return cc.error('The "url" type of "%s.%s" must be child class of cc.RawAsset.', className, propName);
        }
        if (cc.isChildClassOf(url, cc.Asset)) {
            return cc.error('The "url" type of "%s.%s" must not be child class of cc.Asset, ' +
                'otherwise you should use "type: %s" instead.', className, propName, cc.js.getClassName(url));
        }
        if (val.type) {
            return cc.warn('Can not specify "type" attribute for "%s.%s", because its "url" is already defined.', className, propName);
        }
    }
    val.type = url;
}

function parseType (val, type, className, propName) {
    if (Array.isArray(type)) {
        if (CC_EDITOR) {
            var isArray = function (defaultVal) {
                defaultVal = getDefault(defaultVal);
                return Array.isArray(defaultVal);
            };   // require lazily to avoid circular require() calls
            if (!isArray(val.default)) {
                cc.warn('The "default" attribute of "%s.%s" must be an array', className, propName);
            }
        }
        if (type.length > 0) {
            val.type = type = type[0];
        }
        else {
            return cc.error('Invalid type of %s.%s', className, propName);
        }
    }
    if (CC_EDITOR) {
        if (typeof type === 'function') {
            if (cc.RawAsset.isRawAssetType(type)) {
                cc.warn('The "type" attribute of "%s.%s" must be child class of cc.Asset, ' +
                    'otherwise you should use "url: %s" instead', className, propName,
                    cc.js.getClassName(type));
            }
        }
        else if (type === 'Number') {
            cc.warn('The "type" attribute of "%s.%s" can not be "Number", use "Float" or "Integer" instead please.', className, propName);
        }
        else if (type == null) {
            cc.warn('The "type" attribute of "%s.%s" is undefined when loading script.', className, propName);
        }
    }
}

function postCheckType (val, type, className, propName) {
    if (CC_EDITOR && typeof type === 'function') {
        if (cc.Class._isCCClass(type) && val.serializable !== false && !cc.js._getClassId(type, false)) {
            cc.warn('Can not serialize "%s.%s" because the specified type is anonymous, please provide a class name or set the "serializable" attribute of "%s.%s" to "false".', className, propName, className, propName);
        }
    }
}

function getBaseClassWherePropertyDefined_DEV (propName, cls) {
    if (CC_DEV) {
        var res;
        for (; cls && cls.__props__ && cls.__props__.indexOf(propName) !== -1; cls = cls.$super) {
            res = cls;
        }
        if (!res) {
            cc.error('unknown error');
        }
        return res;
    }
}
var preprocessAttrs =  function (properties, className, cls) {
    for (var propName in properties) {
        var val = properties[propName];
        var isLiteral = val && val.constructor === Object;

        if ( !isLiteral ) {
            if (Array.isArray(val) && val.length > 0) {
                val = {
                    default: [],
                    type: val
                };
            }
            else if (typeof val === 'function') {
                var type = val;
                if (cc.RawAsset.isRawAssetType(type)) {
                    val = {
                        default: '',
                        url: type
                    };
                }
                else {
                    val = cc.isChildClassOf(type, cc.ValueType) ? {
                        default: new type()
                    } : {
                        default: null,
                        type: val
                    };
                }
            }
            else {
                val = {
                    default: val
                };
            }
            properties[propName] = val;
        }
        if (val) {
            if (CC_EDITOR) {
                if ('default' in val) {
                    if (val.get) {
                        cc.error('The "default" value of "%s.%s" should not be used with a "get" function.',
                            className, propName);
                    }
                    else if (val.set) {
                        cc.error('The "default" value of "%s.%s" should not be used with a "set" function.',
                            className, propName);
                    }
                    else if (cc.Class._isCCClass(val.default)) {
                        val.default = null;
                        cc.error('The "default" value of "%s.%s" can not be an constructor. Set default to null please.',
                            className, propName);
                    }
                }
                else if (!val.get && !val.set) {
                    cc.error('Property "%s.%s" must define at least one of "default", "get" or "set".',
                        className, propName);
                }
            }
            if (CC_DEV && !val.override && cls.__props__.indexOf(propName) !== -1) {
                // check override
                var baseClass = cc.js.getClassName(getBaseClassWherePropertyDefined_DEV(propName, cls));
                cc.warn('"%s.%s" hides inherited property "%s.%s". To make the current property override that implementation, add the `override: true` attribute please.', className, propName, baseClass, propName);
            }
            var notify = val.notify;
            if (notify) {
                parseNotify(val, propName, notify, properties);
            }

            if ('type' in val) {
                parseType(val, val.type, className, propName);
            }

            if ('url' in val) {
                checkUrl(val, className, propName, val.url);
            }

            if ('type' in val) {
                postCheckType(val, val.type, className, propName);
            }
        }
    }
};
var m = {};

m.propertyDefine = function (ctor, sameNameGetSets, diffNameGetSets) {
    function define (np, propName, getter, setter) {
        var pd = Object.getOwnPropertyDescriptor(np, propName);
        if (pd) {
            if (pd.get) np[getter] = pd.get;
            if (pd.set && setter) np[setter] = pd.set;
        }
        else {
            var getterFunc = np[getter];
            if (CC_DEV && !getterFunc) {
                var clsName = (cc.Class._isCCClass(ctor) && cc.js.getClassName(ctor)) ||
                    ctor.name ||
                    '(anonymous class)';
                cc.warn('no %s or %s on %s', propName, getter, clsName);
            }
            else {
                cc.js.getset(np, propName, getterFunc, np[setter]);
            }
        }
    }
    var propName, np = ctor.prototype;
    for (var i = 0; i < sameNameGetSets.length; i++) {
        propName = sameNameGetSets[i];
        var suffix = propName[0].toUpperCase() + propName.slice(1);
        define(np, propName, 'get' + suffix, 'set' + suffix);
    }
    for (propName in diffNameGetSets) {
        var getset = diffNameGetSets[propName];
        define(np, propName, getset[0], getset[1]);
    }
};

/**
 * @param {Number} x
 * @return {Number}
 * Constructor
 */
m.NextPOT = function (x) {
    x = x - 1;
    x = x | (x >> 1);
    x = x | (x >> 2);
    x = x | (x >> 4);
    x = x | (x >> 8);
    x = x | (x >> 16);
    return x + 1;
};

//var DirtyFlags = m.DirtyFlags = {
//    TRANSFORM: 1 << 0,
//    SIZE: 1 << 1,
//    //Visible:
//    //Color:
//    //Opacity
//    //Cache
//    //Order
//    //Text
//    //Gradient
//    ALL: (1 << 2) - 1
//};
//
//DirtyFlags.WIDGET = DirtyFlags.TRANSFORM | DirtyFlags.SIZE;

// wrap a new scope to enalbe minify

// jshint evil: true
m.cleanEval = function (code) {
    return eval(code);
};
m.cleanEval_F = function (code, F) {
    return eval(code);
};
m.cleanEval_fireClass = function (code) {
    var fireClass = eval(code);
    return fireClass;
};
// jshint evil: false
var Misc = m;

var BUILTIN_ENTRIES = ['name', 'extends', 'mixins', 'ctor', 'properties', 'statics', 'editor'];

var TYPO_TO_CORRECT = CC_DEV && {
        extend: 'extends',
        property: 'properties',
        static: 'statics',
        constructor: 'ctor'
    };

var INVALID_STATICS_DEV = CC_DEV && ['name', '__ctors__', '__props__', 'arguments', 'call', 'apply', 'caller',
        'length', 'prototype'];

var deferredInitializer = {

    // Configs for classes which needs deferred initialization
    datas: null,

    // register new class
    // data - {cls: cls, cb: properties, mixins: options.mixins}
    push: function (data) {
        if (this.datas) {
            this.datas.push(data);
        }
        else {
            this.datas = [data];
            // start a new timer to initialize
            var self = this;
            setTimeout(function () {
                self.init();
            }, 0);
        }
    },

    init: function () {
        var datas = this.datas;
        if (datas) {
            for (var i = 0; i < datas.length; ++i) {
                var data = datas[i];
                var cls = data.cls;
                var properties = data.props;
                if (typeof properties === 'function') {
                    properties = properties();
                }
                var name = JS.getClassName(cls);
                if (properties) {
                    declareProperties(cls, name, properties, cls.$super, data.mixins);
                }
                else {
                    cc.error('Properties function of "%s" should return an object!', name);
                }
            }
            this.datas = null;
        }
    }
};

///**
// * both getter and prop must register the name into __props__ array
// * @param {String} name - prop name
// */
function appendProp (cls, name/*, isGetter*/) {
    if (CC_DEV) {
        //var VAR_REG = /^[$A-Za-z_][0-9A-Za-z_$]*$/;
        //if (!VAR_REG.test(name)) {
        //    cc.error('The property name "' + name + '" is not compliant with JavaScript naming standards');
        //    return;
        //}
        if (name.indexOf('.') !== -1) {
            cc.error('Disallow to use "." in property name');
            return;
        }
    }
    if (cls.__props__.indexOf(name) < 0) {
        cls.__props__.push(name);
    }
}

function defineProp (cls, className, propName, defaultValue, attrs) {
    if (CC_DEV) {
        // check default object value
        if (typeof defaultValue === 'object' && defaultValue) {
            if (Array.isArray(defaultValue)) {
                // check array empty
                if (defaultValue.length > 0) {
                    cc.error('Default array must be empty, set default value of %s.%s to [], ' +
                        'and initialize in "onLoad" or "ctor" please. (just like "this.%s = [...];")',
                        className, propName, propName);
                    return;
                }
            }
            else if (!_isPlainEmptyObj_DEV(defaultValue)) {
                // check cloneable
                if (!_cloneable_DEV(defaultValue)) {
                    cc.error('Do not set default value to non-empty object, ' +
                        'unless the object defines its own "clone" function. Set default value of %s.%s to null or {}, ' +
                        'and initialize in "onLoad" or "ctor" please. (just like "this.%s = {foo: bar};")',
                        className, propName, propName);
                    return;
                }
            }
        }

        // check base prototype to avoid name collision
        for (var base = cls.$super; base; base = base.$super) {
            // 这个循环只能检测到最上面的FireClass的父类，如果再上还有父类，将不做检测。
            if (base.prototype.hasOwnProperty(propName)) {
                cc.error('Can not declare %s.%s, it is already defined in the prototype of %s',
                    className, propName, className);
                return;
            }
        }
    }

    // set default value
    Attr.setClassAttr(cls, propName, 'default', defaultValue);

    appendProp(cls, propName);

    // apply attributes
    if (attrs) {
        var onAfterProp = null;
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            Attr.attr(cls, propName, attr);
            // register callback
            if (attr._onAfterProp) {
                onAfterProp = onAfterProp || [];
                onAfterProp.push(attr._onAfterProp);
            }
        }
        // call callback
        if (onAfterProp) {
            for (var c = 0; c < onAfterProp.length; c++) {
                onAfterProp[c](cls, propName);
            }
        }
    }
}

function defineGetSet (cls, name, propName, val, attrs) {
    var getter = val.get;
    var setter = val.set;
    var proto = cls.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, propName);

    if (getter) {
        if (CC_DEV && d && d.get) {
            cc.error('"%s": the getter of "%s" is already defined!', name, propName);
            return;
        }

        if (attrs) {
            for (var i = 0; i < attrs.length; ++i) {
                var attr = attrs[i];
                if (CC_DEV && attr._canUsedInGetter === false) {
                    cc.error('Can not apply the specified attribute to the getter of "%s.%s", ' +
                        'attribute index: %s', name, propName, i);
                    continue;
                }

                Attr.attr(cls, propName, attr);

                // check attributes
                if (CC_DEV && (attr.serializable === false || attr.editorOnly === true)) {
                    cc.warn('No need to use "serializable: false" or "editorOnly: true" for ' +
                        'the getter of "%s.%s", every getter is actually non-serialized.',
                        name, propName);
                }
            }
        }

        var ForceSerializable = false;
        if (!ForceSerializable) {
            Attr.attr(cls, propName, Attr.NonSerialized);
        }
        if (ForceSerializable || CC_DEV) {
            // 不论是否 hide in inspector 都要添加到 props，否则 asset watcher 不能正常工作
            appendProp(cls, propName/*, true*/);
        }

        if (d) {
            Object.defineProperty(proto, propName, {
                get: getter
            });
        }
        else {
            Object.defineProperty(proto, propName, {
                get: getter,
                configurable: true,
                enumerable: true
            });
        }

        if (CC_DEV) {
            Attr.setClassAttr(cls, propName, 'hasGetter', true); // 方便 editor 做判断
        }
    }

    if (setter) {
        if (CC_DEV) {
            if (d && d.set) {
                return cc.error('"%s": the setter of "%s" is already defined!', name, propName);
            }

            Object.defineProperty(proto, propName, {
                set: setter,
                configurable: true,
                enumerable: true
            });
            Attr.setClassAttr(cls, propName, 'hasSetter', true); // 方便 editor 做判断
        }
        else {
            if (d) {
                Object.defineProperty(proto, propName, {
                    set: setter
                });
            }
            else {
                Object.defineProperty(proto, propName, {
                    set: setter,
                    configurable: true,
                    enumerable: true
                });
            }
        }
    }
}

function getDefault (defaultVal) {
    if (typeof defaultVal === 'function') {
        if (CC_EDITOR) {
            try {
                return defaultVal();
            }
            catch (e) {
                cc._throw(e);
                return undefined;
            }
        }
        else {
            return defaultVal();
        }
    }
    return defaultVal;
}

function doDefine (className, baseClass, mixins, constructor, options) {
    var fireClass = _createCtor(constructor, baseClass, mixins, className, options);

    // extend - (NON-INHERITED) Create a new Class that inherits from this Class
    Object.defineProperty(fireClass, 'extend', {
        value: function (options) {
            options.extends = this;
            return CCClass(options);
        },
        writable: true,
        configurable: true
    });

    if (baseClass) {
        JS.extend(fireClass, baseClass);    // 这里会把父类的 __props__ 复制给子类
        fireClass.$super = baseClass;
    }

    if (mixins) {
        for (var m = 0; m < mixins.length; ++m) {
            var mixin = mixins[m];
            // mixin prototype
            JS.mixin(fireClass.prototype, mixin.prototype);

            // mixin statics (this will also copy editor attributes for component)
            for (var p in mixin)
                if (mixin.hasOwnProperty(p) && (!CC_DEV || INVALID_STATICS_DEV.indexOf(p) < 0))
                    fireClass[p] = mixin[p];

            // mixin attributes
            if (CCClass._isCCClass(mixin)) {
                JS.mixin(Attr.getClassAttrs(fireClass).constructor.prototype,
                    Attr.getClassAttrs(mixin).constructor.prototype);
            }
        }
        // restore constuctor overridden by mixin
        fireClass.prototype.constructor = fireClass;
    }

    fireClass.prototype.__initProps__ = compileProps;

    JS.setClassName(className, fireClass);
    return fireClass;
}

function define (className, baseClasses, mixins, constructor, options) {
    if (cc.isChildClassOf(baseClasses, cc.Component)) {
        var frame = cc._RFpeek();
        if (frame) {
            if (CC_DEV && constructor) {
                cc.warn('Should not define constructor for cc.Component %s.', className);
            }
            if (frame.beh) {
                cc.error('Each script can have at most one Component.');
                return cls;
            }
            var uuid = frame.uuid;
            if (uuid) {
                if (CC_EDITOR && className) {
                    cc.warn('Should not specify class name %s for Component which defines in project.', className);
                }
            }
            //else {
            //    builtin
            //}
            className = className || frame.script;
            var cls = doDefine(className, baseClasses, mixins, constructor, options);
            if (uuid) {
                JS._setClassId(uuid, cls);
                if (CC_EDITOR) {
                    cc.Component._addMenuItem(cls, 'i18n:MAIN_MENU.component.scripts/' + className, -1);
                    cls.prototype.__scriptUuid = Editor.Utils.UuidUtils.decompressUuid(uuid);
                }
            }
            frame.beh = cls;
            return cls;
        }
    }
    // not project component
    return doDefine(className, baseClasses, mixins, constructor, options);
}

function normalizeClassName (className) {
    if (CC_DEV) {
        var DefaultName = 'CCClass';
        if (className) {
            className = className.replace(/\./g, '_');
            className = className.split('').filter(function (x) { return /^[a-zA-Z0-9_$]/.test(x); }).join('');
            if (/^[0-9]/.test(className[0])) {
                className = '_' + className;
            }
            try {
                // validate name
                eval('function ' + className + '(){}');
            }
            catch (e) {
                className = 'FireClass_' + className;
                try {
                    eval('function ' + className + '(){}');
                }
                catch (e) {
                    return DefaultName;
                }
            }
            return className;
        }
        return DefaultName;
    }
}

function getNewValueTypeCode (value) {
    var clsName = JS.getClassName(value);
    var type = value.constructor;
    var res = 'new ' + clsName + '(';
    var i;
    if (type === cc.Mat3 || type === cc.Mat4) {
        var data = value.data;
        for (i = 0; i < data.length; i++) {
            res += data[i];
            if (i < data.length - 1) {
                res += ',';
            }
        }
    }
    else {
        for (i = 0; i < type.__props__.length; i++) {
            var prop = type.__props__[i];
            var propVal = value[prop];
            if (typeof propVal === 'object') {
                cc.error('Can not construct %s because it contains object property.', clsName);
                return 'new ' + clsName + '()';
            }
            res += propVal;
            if (i < type.__props__.length - 1) {
                res += ',';
            }
        }
    }
    return res + ')';
}

// TODO - move escapeForJS, VAR_REG, getNewValueTypeCode to misc.js or a new source file

// convert a normal string including newlines, quotes and unicode characters into a string literal
// ready to use in JavaScript source
function escapeForJS (s) {
    return JSON.stringify(s).
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    replace(/\u2028/g, '\\u2028').
               replace(/\u2029/g, '\\u2029');
}

// simple test variable name
var VAR_REG = /^[$A-Za-z_][0-9A-Za-z_$]*$/;
function compileProps (actualClass) {
    // init deferred properties
    var attrs = Attr.getClassAttrs(actualClass);
    var propList = actualClass.__props__;
    if (propList === null) {
        deferredInitializer.init();
        propList = actualClass.__props__;
    }

    // functions for generated code
    var F = [];
    var func = '(function(){\n';

    for (var i = 0; i < propList.length; i++) {
        var prop = propList[i];
        var attrKey = prop + Attr.DELIMETER + 'default';
        if (attrKey in attrs) {  // getter does not have default
            var statement;
            if (VAR_REG.test(prop)) {
                statement = 'this.' + prop + '=';
            }
            else {
                statement = 'this[' + escapeForJS(prop) + ']=';
            }
            var expression;
            var def = attrs[attrKey];
            if (typeof def === 'object' && def) {
                if (def instanceof cc.ValueType) {
                    expression = getNewValueTypeCode(def);
                }
                else if (Array.isArray(def)) {
                    expression = '[]';
                }
                else {
                    expression = '{}';
                }
            }
            else if (typeof def === 'function') {
                var index = F.length;
                F.push(def);
                expression = 'F[' + index + ']()';
                if (CC_EDITOR) {
                    func += 'try {\n' + statement + expression + ';\n}\ncatch(e) {\ncc._throw(e);\n' + statement + 'undefined;\n}\n';
                    continue;
                }
            }
            else if (typeof def === 'string') {
                expression = escapeForJS(def);
            }
            else {
                // number, boolean, null, undefined
                expression = def;
            }
            statement = statement + expression + ';\n';
            func += statement;
        }
    }

    func += '})';

    // if (CC_TEST && !isPhantomJS) {
    //     console.log(func);
    // }

    // overwite __initProps__ to avoid compile again
    actualClass.prototype.__initProps__ = Misc.cleanEval_F(func, F);

    // call instantiateProps immediately, no need to pass actualClass into it anymore
    this.__initProps__();
}

function _createCtor (ctor, baseClass, mixins, className, options) {
    var useTryCatch = ! (className && className.startsWith('cc.'));
    var shouldAddProtoCtor;
    if (CC_EDITOR && ctor && baseClass) {
        // check super call in constructor
        var originCtor = ctor;
        if (SuperCallReg.test(ctor)) {
            cc.warn(cc._LogInfos.Editor.Class.callSuperCtor, className);
            // suppresss super call
            ctor = function () {
                this._super = function () {};
                var ret = originCtor.apply(this, arguments);
                this._super = null;
                return ret;
            };
        }
        if (/\bprototype.ctor\b/.test(originCtor)) {
            cc.warn(cc._LogInfos.Editor.Class.callSuperCtor, className);
            shouldAddProtoCtor = true;
        }
    }
    var superCallBounded = options && baseClass && boundSuperCalls(baseClass, options, className);

    if (CC_DEV && ctor) {
        // check ctor
        if (CCClass._isCCClass(ctor)) {
            cc.error('ctor of "%s" can not be another CCClass', className);
        }
        if (typeof ctor !== 'function') {
            cc.error('ctor of "%s" must be function type', className);
        }
        if (ctor.length > 0 && !className.startsWith('cc.')) {
            // fireball-x/dev#138: To make a unified CCClass serialization process,
            // we don't allow parameters for constructor when creating instances of CCClass.
            // For advance user, construct arguments can still get from 'arguments'.
            cc.warn('Can not instantiate CCClass "%s" with arguments.', className);
        }
    }
    // get base user constructors
    var ctors = [];
    var baseOrMixins = [baseClass].concat(mixins);
    for (var b = 0; b < baseOrMixins.length; b++) {
        var baseOrMixin = baseOrMixins[b];
        if (baseOrMixin) {
            if (CCClass._isCCClass(baseOrMixin)) {
                var baseCtors = baseOrMixin.__ctors__;
                if (baseCtors) {
                    for (var c = 0; c < baseCtors.length; c++) {
                        if (ctors.indexOf(baseCtors[c]) < 0) {
                            ctors.push(baseCtors[c]);
                        }
                    }
                }
            }
            else {
                if (ctors.indexOf(baseOrMixin) < 0) {
                    ctors.push(baseOrMixin);
                }
            }
        }
    }

    // append subclass user constructors
    if (ctor) {
        ctors.push(ctor);
    }

    // create class constructor
    var body;
    if (CC_DEV) {
        body = '(function ' + normalizeClassName(className) + '(){\n';
    }
    else {
        body = '(function(){\n';
    }
    if (superCallBounded) {
        body += 'this._super=null;\n';
    }

    // instantiate props
    body += 'this.__initProps__(fireClass);\n';

    // call user constructors
    if (ctors.length > 0) {
        body += 'var cs=fireClass.__ctors__;\n';

        if (useTryCatch) {
            body += 'try{\n';
        }

        if (ctors.length <= 5) {
            for (var i = 0; i < ctors.length; i++) {
                body += '(cs[' + i + ']).apply(this,arguments);\n';
            }
        }
        else {
            body += 'for(var i=0,l=cs.length;i<l;++i){\n';
            body += '(cs[i]).apply(this,arguments);\n}\n';
        }

        if (useTryCatch) {
            body += '}catch(e){\ncc._throw(e);\n}\n';
        }
    }
    body += '})';

    // jshint evil: true
    var fireClass = Misc.cleanEval_fireClass(body);
    // jshint evil: false

    Object.defineProperty(fireClass, '__ctors__', {
        value: ctors.length > 0 ? ctors : null,
        // writable should be false,
        // enumerable should be false
    });

    if (CC_EDITOR && shouldAddProtoCtor) {
        fireClass.prototype.ctor = function () {};
    }
    return fireClass;
}

var SuperCallReg = /xyz/.test(function(){xyz}) ? /\b_super\b/ : /.*/;
var SuperCallRegStrict = /xyz/.test(function(){xyz}) ? /this\._super\s*\(/ : /(NONE){99}/;
function boundSuperCalls (baseClass, options, className) {
    var hasSuperCall = false;
    for (var funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) >= 0) {
            continue;
        }
        var func = options[funcName];
        if (typeof func !== 'function') {
            continue;
        }
        var pd = JS.getPropertyDescriptor(baseClass.prototype, funcName);
        if (pd) {
            var superFunc = pd.value;
            // ignore pd.get, assume that function defined by getter is just for warnings
            if (typeof superFunc === 'function') {
                if (SuperCallReg.test(func)) {
                    hasSuperCall = true;
                    // boundSuperCall
                    options[funcName] = (function (superFunc, func) {
                        return function () {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method but on the super-Class
                            this._super = superFunc;

                            var ret = func.apply(this, arguments);

                            // The method only need to be bound temporarily, so we remove it when we're done executing
                            this._super = tmp;

                            return ret;
                        };
                    })(superFunc, func);
                }
                continue;
            }
        }
        if (CC_DEV && SuperCallRegStrict.test(func)) {
            cc.warn('this._super declared in "%s.%s" but no super method defined', className, funcName);
        }
    }
    return hasSuperCall;
}

function declareProperties (cls, className, properties, baseClass, mixins) {
    cls.__props__ = [];

    if (baseClass && baseClass.__props__) {
        cls.__props__ = baseClass.__props__.slice();
    }

    if (mixins) {
        for (var m = 0; m < mixins.length; ++m) {
            var mixin = mixins[m];
            if (mixin.__props__) {
                cls.__props__ = cls.__props__.concat(mixin.__props__.filter(function (x) {
                    return cls.__props__.indexOf(x) < 0;
                }));
            }
        }
    }

    if (properties) {
        // 预处理属性
        preprocessAttrs(properties, className, cls);

        for (var propName in properties) {
            var val = properties[propName];
            var attrs = parseAttributes(val, className, propName);
            if ('default' in val) {
                defineProp(cls, className, propName, val.default, attrs);
            }
            else {
                defineGetSet(cls, className, propName, val, attrs);
            }
        }
    }
}

/**
 * @module cc
 */

/**
 * !#en Defines a CCClass using the given specification, please see [Class](/en/scripting/class/) for details.
 * !#zh 定义一个 CCClass，传入参数必须是一个包含类型参数的字面量对象，具体用法请查阅[类型定义](/zh/scripting/class/)。
 *
 * @method Class
 *
 * @param {Object} [options]
 * @param {String} [options.name] - The class name used for serialization.
 * @param {Function} [options.extends] - The base class.
 * @param {Function} [options.ctor] - The constructor.
 * @param {Object} [options.properties] - The property definitions.
 * @param {Object} [options.statics] - The static members.
 * @param {Function[]} [options.mixins]
 *
 * @param {Object} [options.editor] - attributes for Component listed below.
 * @param {Component} [options.editor.requireComponent] - Automatically add required component as a dependency.
 * @param {Component} [options.editor.disallowMultiple] - If specified to a type, prevents Component of the same type (or subtype) to be added more than once to a Node.
 * @param {String} [options.editor.menu] - The menu path to register a component to the editors "Component" menu. Eg. "Rendering/Camera".
 * @param {Boolean} [options.editor.executeInEditMode] - Makes a component execute in edit mode. By default, all components are only executed in play mode, which means they will not have their callback functions executed while the Editor is in edit mode.
 * @param {Boolean} [options.editor.playOnFocus] - This property is only available if executeInEditMode is true. If specified, the editor's scene view will keep updating this node in 60 fps when it is selected, otherwise, it will update only if necessary.
 * @param {String} [options.editor.inspector] - Specifying the url of the custom html to draw the component in inspector.
 * @param {String} [options.editor.icon] - Specifying the url of the icon to display in inspector.
 * @param {String} [options.editor.help] - The custom documentation UR
 *
 * @param {Function} [options.update] - lifecycle method for Component, see {{#crossLink "Component/update:method"}}{{/crossLink}}
 * @param {Function} [options.lateUpdate] - lifecycle method for Component, see {{#crossLink "Component/lateUpdate:method"}}{{/crossLink}}
 * @param {Function} [options.onLoad] - lifecycle method for Component, see {{#crossLink "Component/onLoad:method"}}{{/crossLink}}
 * @param {Function} [options.start] - lifecycle method for Component, see {{#crossLink "Component/start:method"}}{{/crossLink}}
 * @param {Function} [options.onEnable] - lifecycle method for Component, see {{#crossLink "Component/onEnable:method"}}{{/crossLink}}
 * @param {Function} [options.onDisable] - lifecycle method for Component, see {{#crossLink "Component/onDisable:method"}}{{/crossLink}}
 * @param {Function} [options.onDestroy] - lifecycle method for Component, see {{#crossLink "Component/onDestroy:method"}}{{/crossLink}}
 * @param {Function} [options.onFocusInEditor] - lifecycle method for Component, see {{#crossLink "Component/onFocusInEditor:method"}}{{/crossLink}}
 * @param {Function} [options.onLostFocusInEditor] - lifecycle method for Component, see {{#crossLink "Component/onLostFocusInEditor:method"}}{{/crossLink}}
 * @param {Function} [options.resetInEditor] - lifecycle method for Component, see {{#crossLink "Component/resetInEditor:method"}}{{/crossLink}}
 * @param {Function} [options.onRestore] - for Component only, see {{#crossLink "Component/onRestore:method"}}{{/crossLink}}
 * @param {Function} [options._getLocalBounds] - for Component only, see {{#crossLink "Component/_getLocalBounds:method"}}{{/crossLink}}
 *
 * @return {Function} - the created class
 *
 * @example
 // define base class
 var Node = cc.Class();

 // define sub class
 var Sprite = cc.Class({
        name: 'Sprite',
        extends: Node,
        ctor: function () {
            this.url = "";
            this.id = 0;
        },

        properties {
            width: {
                default: 128,
                type: 'Integer',
                tooltip: 'The width of sprite'
            },
            height: 128,
            size: {
                get: function () {
                    return cc.v2(this.width, this.height);
                }
            }
        },

        load: function () {
            // load this.url
        };
    });

 // instantiate

 var obj = new Sprite();
 obj.url = 'sprite.png';
 obj.load();

 // define static member

 Sprite.count = 0;
 Sprite.getBounds = function (spriteList) {
        // ...
    };
 */
function CCClass (options) {
    if (!options) {
        return define();
    }

    var name = options.name;
    var base = options.extends/* || CCObject*/;
    var mixins = options.mixins;

    // create constructor
    var cls;
    cls = define(name, base, mixins, options.ctor, options);
    if (!name) {
        name = cc.js.getClassName(cls);
    }

    // define Properties
    var properties = options.properties;
    if (typeof properties === 'function' ||
        (base && base.__props__ === null) ||
        (mixins && mixins.some(function (x) {
            return x.__props__ === null;
        }))
    ) {
        deferredInitializer.push({cls: cls, props: properties, mixins: mixins});
        cls.__props__ = null;
    }
    else {
        declareProperties(cls, name, properties, base, options.mixins);
    }

    // define statics
    var statics = options.statics;
    if (statics) {
        var staticPropName;
        if (CC_DEV) {
            for (staticPropName in statics) {
                if (INVALID_STATICS_DEV.indexOf(staticPropName) !== -1) {
                    cc.error('Cannot define %s.%s because static member name can not be "%s".', name, staticPropName,
                        staticPropName);
                }
            }
        }
        for (staticPropName in statics) {
            cls[staticPropName] = statics[staticPropName];
        }
    }

    // define functions
    for (var funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) >= 0) {
            continue;
        }
        if (CC_EDITOR && funcName === 'constructor') {
            cc.error('Can not define a member called "constructor" in the class "%s", please use "ctor" instead.', name);
            continue;
        }
        var func = options[funcName];
        if (typeof func === 'function' || func === null) {
            // use defineProperty to redefine some super method defined as getter
            Object.defineProperty(cls.prototype, funcName, {
                value: func,
                enumerable: true,
                configurable: true,
                writable: true,
            });
        }
        else if (CC_DEV) {
            if (func === false && base && base.prototype) {
                // check override
                var overrided = base.prototype[funcName];
                if (typeof overrided === 'function') {
                    var baseFuc = JS.getClassName(base) + '.' + funcName;
                    var subFuc = name + '.' + funcName;
                    cc.warn('"%s" overrided "%s" but "%s" is defined as "false" so the super method will not be called. You can set "%s" to null to disable this warning.', subFuc, baseFuc, subFuc, subFuc);
                }
            }
            var correct = TYPO_TO_CORRECT[funcName];
            if (correct) {
                cc.warn('Unknown type of %s.%s, maybe you want is "%s".', name, funcName, correct);
            }
            else if (func) {
                cc.error('Unknown type of %s.%s, property should be defined in "properties" or "ctor"', name, funcName);
            }
        }
    }

    if (CC_DEV) {
        var editor = options.editor;
        if (editor) {
            if (cc.isChildClassOf(base, cc.Component)) {
                cc.Component._registerEditorProps(cls, editor);
            }
            else {
                cc.warn('Can not use "editor" attribute, "%s" not inherits from Components.', name);
            }
        }
    }

    return cls;
}

/**
 * Checks whether the constructor is created by cc.Class
 *
 * @method _isCCClass
 * @param {Function} constructor
 * @return {Boolean}
 * @private
 */
CCClass._isCCClass = function (constructor) {
    return !!constructor && typeof constructor.__ctors__ !== 'undefined';
};

//
// Optimized define function only for internal classes
//
// @method _fastDefine
// @param {String} className
// @param {Function} constructor
// @param {Object} serializableFields
// @private
//
CCClass._fastDefine = function (className, constructor, serializableFields) {
    JS.setClassName(className, constructor);
    //constructor.__ctors__ = constructor.__ctors__ || null;
    var props = constructor.__props__ = Object.keys(serializableFields);
    for (var i = 0; i < props.length; i++) {
        var key = props[i];
        var val = serializableFields[key];
        Attr.setClassAttr(constructor, key, 'visible', false);
        Attr.setClassAttr(constructor, key, 'default', val);
    }
};

/**
 * Checks whether subclass is child of superclass or equals to superclass
 *
 * @method isChildClassOf
 * @param {Function} subclass
 * @param {Function} superclass
 * @return {Boolean}
 */
cc.isChildClassOf = function (subclass, superclass) {
    if (subclass && superclass) {
        if (typeof subclass !== 'function') {
            return false;
        }
        if (typeof superclass !== 'function') {
            if (CC_DEV) {
                cc.warn('[isChildClassOf] superclass should be function type, not', superclass);
            }
            return false;
        }
        if (subclass === superclass) {
            return true;
        }
        for (;;) {
            if (CC_JSB && subclass.$super) {
                subclass = subclass.$super;
            }
            else {
                var proto = subclass.prototype; // binded function do not have prototype
                var dunderProto = proto && Object.getPrototypeOf(proto);
                subclass = dunderProto && dunderProto.constructor;
            }
            if (!subclass) {
                return false;
            }
            if (subclass === superclass) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Return all super classes
 * @method getInheritanceChain
 * @param {Function} constructor
 * @return {Function[]}
 */
CCClass.getInheritanceChain = function (klass) {
    var chain = [];
    for (;;) {
        if (CC_JSB && klass.$super) {
            klass = klass.$super;
        }
        else {
            var dunderProto = Object.getPrototypeOf(klass.prototype);
            klass = dunderProto && dunderProto.constructor;
        }
        if (!klass) {
            break;
        }
        if (klass !== Object) {
            chain.push(klass);
        }
    }
    return chain;
};

var PrimitiveTypes = {
    // Specify that the input value must be integer in Inspector.
    // Also used to indicates that the type of elements in array or the type of value in dictionary is integer.
    Integer: 'Number',
    // Indicates that the type of elements in array or the type of value in dictionary is double.
    Float: 'Number',
    Boolean: 'Boolean',
    String: 'String',
};
var tmpAttrs = [];
function parseAttributes (attrs, className, propName) {
    var ERR_Type = CC_DEV ? 'The %s of %s must be type %s' : '';

    tmpAttrs.length = 0;
    var result = tmpAttrs;

    var type = attrs.type;
    if (type) {
        var primitiveType = PrimitiveTypes[type];
        if (primitiveType) {
            result.push({
                type: type,
                _onAfterProp: getTypeChecker(primitiveType, 'cc.' + type)
            });
        }
        else if (type === 'Object') {
            if (CC_DEV) {
                cc.error('Please define "type" parameter of %s.%s as the actual constructor.', className, propName);
            }
        }
        else {
            if (type === Attr.ScriptUuid) {
                var attr = Attr.ObjectType(cc.ScriptAsset);
                attr.type = 'Script';
                result.push(attr);
            }
            else {
                if (typeof type === 'object') {
                    if (Enum.isEnum(type)) {
                        result.push({
                            type: 'Enum',
                            enumList: Enum.getList(type)
                        });
                    }
                    else if (CC_DEV) {
                        cc.error('Please define "type" parameter of %s.%s as the constructor of %s.', className, propName, type);
                    }
                }
                else if (typeof type === 'function') {
                    if (attrs.url) {
                        result.push({
                            type: 'Object',
                            ctor: type,
                            _onAfterProp: getTypeChecker('String', 'cc.String')
                        });
                    }
                    else {
                        result.push(Attr.ObjectType(type));
                    }
                }
                else if (CC_DEV) {
                    cc.error('Unknown "type" parameter of %s.%s：%s', className, propName, type);
                }
            }
        }
    }

    function parseSimpleAttr (attrName, expectType, attrCreater) {
        if (attrName in attrs) {
            var val = attrs[attrName];
            if (typeof val === expectType) {
                if ( !attrCreater ) {
                    var attr = {};
                    attr[attrName] = val;
                    result.push(attr);
                }
                else {
                    result.push(typeof attrCreater === 'function' ? attrCreater(val) : attrCreater);
                }
            }
            else if (CC_DEV) {
                cc.error(ERR_Type, attrName, className, propName, expectType);
            }
        }
    }

    parseSimpleAttr('rawType', 'string', Attr.RawType);
    parseSimpleAttr('editorOnly', 'boolean', Attr.EditorOnly);
    //parseSimpleAttr('preventDeferredLoad', 'boolean');
    if (CC_DEV) {
        parseSimpleAttr('displayName', 'string');
        parseSimpleAttr('multiline', 'boolean', {multiline: true});
        parseSimpleAttr('readonly', 'boolean', {readonly: true});
        parseSimpleAttr('tooltip', 'string');
        parseSimpleAttr('slide', 'boolean');
    }

    if (attrs.url) {
        result.push({ saveUrlAsAsset: true });
    }
    if (attrs.serializable === false) {
        result.push(Attr.NonSerialized);
    }
    if (CC_EDITOR) {
        if ('animatable' in attrs && !attrs.animatable) {
            result.push({ animatable: false });
        }
    }

    if (CC_DEV) {
        var visible = attrs.visible;
        if (typeof visible !== 'undefined') {
            if (!visible) {
                result.push({visible: false});
            }
            else if (typeof visible === 'function') {
                result.push({visible: visible});
            }
        }
        else {
            var startsWithUS = (propName.charCodeAt(0) === 95);
            if (startsWithUS) {
                result.push({visible: false});
            }
        }
    }

    //if (attrs.custom) {
    //    result.push( { custom: attrs.custom });
    //}

    var range = attrs.range;
    if (range) {
        if (Array.isArray(range)) {
            if (range.length >= 2) {
                result.push({ min: range[0], max: range[1], step: range[2] });
            }
            else if (CC_DEV) {
                cc.error('The length of range array must be equal or greater than 2');
            }
        }
        else if (CC_DEV) {
            cc.error(ERR_Type, 'range', className, propName, 'array');
        }
    }
    parseSimpleAttr('min', 'number');
    parseSimpleAttr('max', 'number');
    parseSimpleAttr('step', 'number');

    return result;
}

module.exports = {
    isArray: function (defaultVal) {
        defaultVal = getDefault(defaultVal);
        return Array.isArray(defaultVal);
    },
    fastDefine: CCClass._fastDefine,
    getNewValueTypeCode: getNewValueTypeCode,
    VAR_REG: VAR_REG,
    escapeForJS: escapeForJS,
    define: define,
    declareProperties: declareProperties
};