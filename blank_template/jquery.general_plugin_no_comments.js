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
        version = 'v1.0.2',
        dependancies = [],
        local_namespace = {},
        CONST = {
            LANG: {
                EN: 'en-US',
                BG: 'bg-BG'
            },
            SELECTOR: {
                BODY: 'body'
            },
            EMPTY_STRING: '',
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
            REGEXP: {
                TEXT_OPEN: '|%',
                TEXT_CLOSE: '%|',
                VALUE_OPEN: '[[',
                VALUE_CLOSE: ']]',
                GLOBAL_IGNORE_CASE: 'gi',
                ESCAPE_SPECIAL_CHARACTERS: /[-[\]{}()*+?.,\\^$|#\s]/g,
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

    local_namespace[pluginName] = function (options) {
        var obj = this;
        this.defaults = {
            lang: 'en-US',
            templates: {
                example_template: '<div>|%some_text%| - [[some_value]]</div>'
            }
        };

        this.$selectors = {
            body: $(CONST.SELECTOR.BODY)
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});

        this.localization = window.Localization[pluginName][this.settings.lang || window.navigator.language];

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

    if (!$[pluginName])
        $[pluginName] = function (options) {

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

                var $body = $(CONST.SELECTOR.BODY),
                    data = $body.data(pluginName);

                if (!data || typeof data === CONST.DATA_TYPE.UNDEFINED) {
                    var instance = new local_namespace[pluginName](this, options);
                    $body.data(pluginName, instance);
                } else {
                    if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] === CONST.FUNCTION)
                        result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                    else if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] !== CONST.FUNCTION) {
                        if (window.console && console.error)
                            console.error(data.renderTemplate(window.Localization.global.method_not_found, {pluginName: pluginName, method: options}));
                    } else if (typeof options === CONST.DATA_TYPE.STRING)
                        data.setSettings(options, args);
                    else if (typeof options === CONST.DATA_TYPE.UNDEFINED)
                        if (window.console && console.error)
                            console.error(data.renderTemplate(window.Localization.global.already_initialized, {pluginName: pluginName}));
                }

                return result || this;
            } else {
                throw new Error(pluginName + window.Localization.global.plugins_needed + missing_dependancies.join(',\n'));
            }
        };
    else
        throw new Error('Plugin with the name "' + pluginName + '" is already initialized as part of jQuery!');
}));