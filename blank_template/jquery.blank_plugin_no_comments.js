/**
 * TITLE: jQuery blank template plugin with AMD and localization support 
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.3
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 */

;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'jQuery',
            'jQuery.ui'
        ], factory);
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    var pluginName = 'blank_plugin',
        version = 'v1.0.3',
        dependancies = [],
        NS = {},
        CONST = {
            LANG: {
                EN: 'en-US',
                BG: 'bg-BG'
            },
            SELECTOR: {
                BODY: 'body',
                CLASS: '.',
                LAST_ELEMENT: ':last',
                HIDDEN: ':hidden'
            },
            ELEMENTS: {
                DIV: '<div/>'
            },
            CHAR: {
                DASH: '-'
            },
            KEYCODE: {
                ENTER: 13,
                ESCAPE: 27,
                SEMICOLON: 186,
                COMMA: 188
            },
            EVENTS: {
                CLICK: 'click',
                KEYUP: 'keyup',
                KEYDOWN: 'keydown',
                FOCUS: 'focus',
                BLUR: 'blur'
            },
            ATTRIBUTE: {
                LANG: 'lang',
                CLASS: 'class',
                PLACEHOLDER: 'placeholder'
            },
            DATA_TYPE: {
                UNDEFINED: 'undefined',
                FUNCTION: 'function',
                STRING: 'string',
                OBJECT: 'object',
                BOOLEAN: 'boolean',
                NUMBER: 'number',
                DATE: 'date',
                IMAGE: 'image',
                VIDEO: 'video'
            },
            EMPTY_STRING: '',
            IMAGE: 'image',
            VIDEO: 'video',
            REGEXP: {
                TEXT_OPEN: '|%',
                TEXT_CLOSE: '%|',
                VALUE_OPEN: '[[',
                VALUE_CLOSE: ']]',
                GLOBAL_IGNORE_CASE: 'gi',
                EVERY_TRANSLATABLE_TEXT: /\|\%(.+?)\%\|/gi,
                EVERY_VALUE: /\[\[(.+?)\]\]/gi
            }
        };

    if (!String.escapeSpecialChars)
        $.extend(String.prototype, {
            escapeSpecialChars: function () {
                this.replace(CONST.REGEXP.ESCAPE_SPECIAL_CHARACTERS, '\\$&');
            }
        });

    if (typeof window.Localization === CONST.DATA_TYPE.UNDEFINED)
        window.Localization = {};

    if (typeof window.Localization.global === CONST.DATA_TYPE.UNDEFINED) {
        window.Localization.global = {
            already_initialized: '[[pluginName]] is already initialized!',
            no_valid_option: 'Please, provide valid option to change and its value or the whole settings object!',
            plugins_needed: ' needs these jQuery plugin(s) to be loaded: ',
            method_not_found: '[[pluginName]] method "[[method]]" not found!',
            text_not_provided: 'Please, provide text variable!',
            no_template_and_data: 'Please, provide valid template AND data!'
        };
    }

    window.Localization[pluginName] = {
        'en-US': {},
        'bg-BG': {}
    };

    NS[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            lang: 'en-US',
            templates: {
                example_template: '<div>|%some_translatable_text%| - [[some_value]]</div>'
            }
        };

        this.$selectors = {
            root: $(element),
            body: $(CONST.SELECTOR.BODY)
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});

        var body_lang = this.$selectors.body.attr(CONST.ATTRIBUTE.LANG);
        
        if (!/^\w{2}\-\w{2}/.test(body_lang))
            body_lang = body_lang + CONST.CHAR.DASH + body_lang.toUpperCase();
        
        var lang_use = (typeof (options || {}).lang !== CONST.DATA_TYPE.UNDEFINED && (options || {}).lang !== this.defaults.lang)? this.settings.lang : (body_lang || window.navigator.language );
        
        this.localization = window.Localization[pluginName][lang_use] || window.Localization[pluginName][this.defaults.lang];

        var _ = {
            ie_lt_9: ($.browser.msie && parseFloat($.browser.version) > 9) || (!$.browser.msie && window.navigator.userAgent.indexOf('Trident') === -1)
        };

        function __construct() {
            _startEventListeners();
            return obj;
        }

        function _startEventListeners() {}

        this.enable = function () {
            return this;
        };

        this.disable = function () {
            return this;
        };

        this.destroy = function () {
            this.$selectors.root.removeData(pluginName);
            return this.$selectors.root;
        };

        __construct();
    };

    NS[pluginName].prototype = {
        translate: function (text, custom_values, lang) {
            var that = this;
            if (text) {
                if (custom_values) {
                    return text.replace(CONST.REGEXP.EVERY_TRANSLATABLE_TEXT, function($0, $1){
                        return custom_values[$1] || $0;
                    });
                } else {
                    return text.replace(CONST.REGEXP.EVERY_TRANSLATABLE_TEXT, function ($0, $1) {
                        if (that.localization[$1])
                            return that.localization[$1];
                        else
                            
                            return that.localization[$1] || CONST.EMPTY_STRING;
                    });
                }
            } else {
                if (window.console && console.error)
                    console.error(window.Localization.global.text_not_provided);
                return false;
            }
        },
        renderTemplate: function (template, data) {
            if (template && data) {
                return this.translate(
                        template.replace(CONST.REGEXP.EVERY_VALUE, function ($0, $1) {
                            return data[$1] || CONST.EMPTY_STRING;
                        })
                        );
            }

            if (window.console && console.error)
                console.error(window.Localization.global.no_template_and_data);
            return false;
        },
        version: function () {
            return version;
        },
        getSettings: function (property) {
            if (property && typeof property === CONST.DATA_TYPE.STRING)
                return this.settings[property];
            else
                return this.settings;
        },
        setSettings: function (option, value) {
            switch (typeof option) {
                case CONST.DATA_TYPE.STRING:
                    if (option && value) {
                        var new_options = {};
                        new_options[option] = value;
                        this.settings = $.extend(true, {}, this.settings, new_options || {});
                        return this.$selectors.root;
                    } else
                        throw new Error(window.Localization.global.no_valid_option);
                    break;
                case CONST.DATA_TYPE.OBJECT:
                    this.settings = $.extend(true, {}, this.settings, option || {});
                    return this.$selectors.root;
                    break;
                default:
                    if (window.console && console.error)
                        console.error(window.Localization.global.no_valid_option);
                    return false;
                    break;
            }
        }
    };

    if (!$.fn[pluginName])
        $.fn[pluginName] = function (options) {

            var all_dependancies_loaded = true,
                    missing_dependancies = [];

            if (dependancies.length > 0) {
                $.each(dependancies, function (i, val) {
                    if (typeof $.fn[val] === CONST.DATA_TYPE.UNDEFINED &&
                        typeof $[val] === CONST.DATA_TYPE.UNDEFINED &&
                        typeof window[val] === CONST.DATA_TYPE.UNDEFINED) {
                            all_dependancies_loaded = false;
                            missing_dependancies.push(val);
                    }
                });
            }

            if (all_dependancies_loaded) {
                var args = arguments,
                        result;

                this.each(function () {
                    var $this = $(this),
                            data = $this.data(pluginName);

                    if (!data || typeof data === CONST.DATA_TYPE.UNDEFINED) {
                        var instance = new NS[pluginName](this, options);
                        $this.data(pluginName, instance);
                    } else {
                        if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] === CONST.DATA_TYPE.FUNCTION)
                            result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                        else if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] !== CONST.DATA_TYPE.FUNCTION) {
                            if (window.console && console.error)
                                console.error(data.renderTemplate(window.Localization.global.method_not_found, {pluginName: pluginName, method: options}));
                        } else if (typeof options === CONST.DATA_TYPE.STRING)
                            data.setSettings(options, args);
                        else if (typeof options === CONST.DATA_TYPE.UNDEFINED)
                            if (window.console && console.error)
                                console.error(data.renderTemplate(window.Localization.global.already_initialized, {pluginName: pluginName}));
                    }
                });

                return result || this;
            } else {
                throw new Error(pluginName + window.Localization.global.plugins_needed + missing_dependancies.join(',\n'));
            }
        };
    else
    if (window.console && console.error)
        console.error('Plugin with the name "' + pluginName + '" is already initialized as part of jQuery!');
}));