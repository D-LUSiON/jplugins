/**
 * TITLE: Font Icon picker
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.0
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 */

/**
 * CHANGELOG
 * 
 * 1.0.0 - Initial build
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
    var pluginName = 'pickIcon',
        version = 'v1.0.0',
        dependancies = [],
        NS = {},
        CONST = {
            LANG: {
                EN: 'en-US',
                BG: 'bg-BG'
            },
            SELECTOR: {
                HEAD: 'head',
                BODY: 'body',
                ID: '#',
                CLASS: '.',
                LAST_ELEMENT: ':last',
                LAST_OF_TYPE: ':last-of-type',
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
        'en-US': {
            error: {
                css_from_cdn: 'You\'re using stylesheet from CDN. Please, include it from local folder!'
            }
        },
        'bg-BG': {}
    };

    NS[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            lang: 'en-US',
            templates: {
                wrap: '<div class="pickIcon-container"/>',
                link: '<link rel="stylesheet" type="text/css" href="[[link]]" media="all">',
                example_template: '<div>|%some_translatable_text%| - [[some_value]]</div>'
            },
            cdn: {
                fontawesome: {
                    title: 'FontAwesome',
                    selector: 'fa',
                    icon_selector: 'fa-',
                    url: 'dist/font-awesome/font-awesome.min.css'
//                    url: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css'
                },
                ionicons: {
                    title: 'Ionic Icons',
                    url: 'dist/ionicons/ionicons.min.css'
//                    url: 'http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css'
                },
                foundation_icons: {
                    title: 'Foundation Icons 3',
                    url: 'dist/foundation-icons/foundation-icons.css'
//                    url: 'https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.min.css'
                },
                themify: {
                    title: 'Themify icons',
                    url: 'dist/themify/themify-icons.css'
                }
            }
        };

        this.$selectors = {
            head: $(CONST.SELECTOR.HEAD),
            body: $(CONST.SELECTOR.BODY),
            root: $(element)
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});

        var body_lang = this.$selectors.body.attr(CONST.ATTRIBUTE.LANG) || this.settings.lang;
        
        if (!/^\w{2}\-\w{2}/.test(body_lang))
            body_lang = body_lang + CONST.CHAR.DASH + body_lang.toUpperCase();
        
        var lang_use = (typeof (options || {}).lang !== CONST.DATA_TYPE.UNDEFINED && (options || {}).lang !== this.defaults.lang)? this.settings.lang : (body_lang || window.navigator.language );
        
        this.localization = window.Localization[pluginName][lang_use] || window.Localization[pluginName][this.defaults.lang];
        
        this.current_icons = [];
        
        var _ = {};

        function __construct() {
            obj.updateCdnIcons();
            _buildHtml();
            _startEventListeners();
            return obj;
        }
        
        function _buildHtml(){
            
        }
        
        this.updateCdnIcons = function(){
            for (var font in this.settings.cdn) {
                if (this.$selectors.head.find('[href="' + this.settings.cdn[font].url + '"]').length === 0) {
                    $(obj.renderTemplate(this.settings.templates.link, {
                        link: this.settings.cdn[font].url
                    } )).insertAfter(this.$selectors.head.find('link' + CONST.SELECTOR.LAST_OF_TYPE));
                }
            }
        };
        
        this.getSelectorsForFont = function(font){
            var stylesheet;
            for (var i = 0, max = document.styleSheets.length; i < max; i++)
                if (document.styleSheets[i].href.indexOf(this.settings.cdn[font].url) > -1)
                    stylesheet = document.styleSheets[i];
            
            if (stylesheet.rules === null) {
                if (window.console && console.error)
                    console.error(localization.error.css_from_cdn);
                return false;
            }
            
            var icons = [];
            for (var i = 0, max = stylesheet.rules.length; i < max; i++) {
                if (/^\.(.+?)::before/.test(stylesheet.rules[i].selectorText)) {
                    var selector = stylesheet.rules[i].selectorText.split(/,\s{0,}/gi).map(function(val){
                        return val.replace(/^\./, CONST.EMPTY_STRING).replace(/:{1,2}(.+?)$/, CONST.EMPTY_STRING);
                    });
                    icons.push({
                        icon: selector[0],
                        alias: selector
                    });
                }
            }
            console.log(icons);
                
            return icons;
        };

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