(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function () {
            return factory(root);
        });
    }
    else if (typeof exports === "object") {
        module.exports = factory(root);
    }
    else {
        root.Polyglot = factory(root);
    }
}(typeof global !== "undefined" ? global : this, function (root) {
    "use strict";
    var replace = String.prototype.replace;
    function Polyglot(options) {
        options = options || {};
        this.phrases = {};
        this.extend(options.phrases || {});
        this.currentLocale = options.locale || "en";
        this.allowMissing = !!options.allowMissing;
        this.warn = options.warn || warn;
    }
    Polyglot.VERSION = "1.0.0";
    Polyglot.prototype.locale = function (newLocale) {
        if (newLocale)
            this.currentLocale = newLocale;
        return this.currentLocale;
    };
    Polyglot.prototype.extend = function (morePhrases, prefix) {
        var phrase;
        for (var key in morePhrases) {
            if (morePhrases.hasOwnProperty(key)) {
                phrase = morePhrases[key];
                if (prefix)
                    key = prefix + "." + key;
                if (typeof phrase === "object") {
                    this.extend(phrase, key);
                }
                else {
                    this.phrases[key] = phrase;
                }
            }
        }
    };
    Polyglot.prototype.unset = function (morePhrases, prefix) {
        var phrase;
        if (typeof morePhrases === "string") {
            delete this.phrases[morePhrases];
        }
        else {
            for (var key in morePhrases) {
                if (morePhrases.hasOwnProperty(key)) {
                    phrase = morePhrases[key];
                    if (prefix)
                        key = prefix + "." + key;
                    if (typeof phrase === "object") {
                        this.unset(phrase, key);
                    }
                    else {
                        delete this.phrases[key];
                    }
                }
            }
        }
    };
    Polyglot.prototype.clear = function () {
        this.phrases = {};
    };
    Polyglot.prototype.replace = function (newPhrases) {
        this.clear();
        this.extend(newPhrases);
    };
    Polyglot.prototype.t = function (key, options) {
        var phrase, result;
        options = options == null ? {} : options;
        if (typeof options === "number") {
            options = { smart_count: options };
        }
        if (typeof this.phrases[key] === "string") {
            phrase = this.phrases[key];
        }
        else if (typeof options._ === "string") {
            phrase = options._;
        }
        else if (this.allowMissing) {
            phrase = key;
        }
        else {
            this.warn("Missing translation for key: \"" + key + "\"");
            result = key;
        }
        if (typeof phrase === "string") {
            options = clone(options);
            result = choosePluralForm(phrase, this.currentLocale, options.smart_count);
            result = interpolate(result, options);
        }
        return result;
    };
    Polyglot.prototype.has = function (key) {
        return key in this.phrases;
    };
    var delimeter = "||||";
    var pluralTypes = {
        chinese: function (n) { return 0; },
        german: function (n) { return n !== 1 ? 1 : 0; },
        french: function (n) { return n > 1 ? 1 : 0; },
        russian: function (n) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; },
        czech: function (n) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; },
        polish: function (n) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); },
        icelandic: function (n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
    };
    var pluralTypeToLanguages = {
        chinese: ["fa", "id", "ja", "ko", "lo", "ms", "th", "tr", "zh"],
        german: ["da", "de", "en", "es", "fi", "el", "he", "hu", "it", "nl", "no", "pt", "sv"],
        french: ["fr", "tl", "pt-br"],
        russian: ["hr", "ru"],
        czech: ["cs", "sk"],
        polish: ["pl"],
        icelandic: ["is"]
    };
    function langToTypeMap(mapping) {
        var type, langs, l, ret = {};
        for (type in mapping) {
            if (mapping.hasOwnProperty(type)) {
                langs = mapping[type];
                for (l in langs) {
                    ret[langs[l]] = type;
                }
            }
        }
        return ret;
    }
    var trimRe = /^\s+|\s+$/g;
    function trim(str) {
        return replace.call(str, trimRe, "");
    }
    function choosePluralForm(text, locale, count) {
        var ret, texts, chosenText;
        if (count != null && text) {
            texts = text.split(delimeter);
            chosenText = texts[pluralTypeIndex(locale, count)] || texts[0];
            ret = trim(chosenText);
        }
        else {
            ret = text;
        }
        return ret;
    }
    function pluralTypeName(locale) {
        var langToPluralType = langToTypeMap(pluralTypeToLanguages);
        return langToPluralType[locale] || langToPluralType.en;
    }
    function pluralTypeIndex(locale, count) {
        return pluralTypes[pluralTypeName(locale)](count);
    }
    var dollarRegex = /\$/g;
    var dollarBillsYall = "$$$$";
    function interpolate(phrase, options) {
        for (var arg in options) {
            if (arg !== "_" && options.hasOwnProperty(arg)) {
                var replacement = options[arg];
                if (typeof replacement === "string") {
                    replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
                }
                phrase = replace.call(phrase, new RegExp("%\\{" + arg + "\\}", "g"), replacement);
            }
        }
        return phrase;
    }
    function warn(message) {
    }
    function clone(source) {
        var ret = {};
        for (var prop in source) {
            ret[prop] = source[prop];
        }
        return ret;
    }
    return Polyglot;
}));
//# sourceMappingURL=polyglot.js.map