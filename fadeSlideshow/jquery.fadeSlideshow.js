/**
 * TITLE: jQuery slideshow with fade effect
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.0
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
    var pluginName = 'fadeSlideshow',
        version = 'v1.0.0',
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
            ELEMENT: {
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
            EVENT: {
                CLICK: 'click',
                KEYUP: 'keyup',
                KEYDOWN: 'keydown',
                FOCUS: 'focus',
                BLUR: 'blur',
                RESIZE: 'resize'
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
            use_css_animations: true,
            anim_time: 500,
            anim_style: 'linear',
            delay: 3500,
            reverse: true,
            stop_on_click: true,
            templates: {
                example_template: '<div>|%some_translatable_text%| - [[some_value]]</div>'
            }
        };

        this.$selectors = {
            root: $(element),
            body: $(CONST.SELECTOR.BODY),
            window: $(window)
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});

        var body_lang = this.$selectors.body.attr(CONST.ATTRIBUTE.LANG);
        
        if (!/^\w{2}\-\w{2}/.test(body_lang))
            body_lang = body_lang + CONST.CHAR.DASH + body_lang.toUpperCase();
        
        var lang_use = (typeof (options || {}).lang !== CONST.DATA_TYPE.UNDEFINED && (options || {}).lang !== this.defaults.lang)? this.settings.lang : (body_lang || window.navigator.language );
        
        this.localization = window.Localization[pluginName][lang_use] || window.Localization[pluginName][this.defaults.lang];
        
        var _ = {
            t: null
        };
        
        this.current_slide = 0;

        function __construct() {
            _preloadImages(function(){
                _prepareHtml();
                _startEventListeners();
                if (obj.settings.delay > 0)
                    obj.start();
            });
            return obj;
        }
        
        function _preloadImages(callback){
            obj.$selectors.images = obj.$selectors.root.find('img');
            
            if (obj.$selectors.images.length > 0) {
                var i = 0;
                
                obj.$selectors.images.each(function(){
                    var $img = $(this),
                        img = new Image();
                        
                    img.onload = function(){
                        i++;
                        if (i === obj.$selectors.images.length && typeof callback === CONST.DATA_TYPE.FUNCTION)
                            callback.apply(obj, []);
                    };

                    img.src = this.src;
                });
                
            } else {
                if (typeof callback === CONST.DATA_TYPE.FUNCTION)
                    callback.apply(obj, []);
            }
        }
        
        function _prepareHtml(){
            obj.$selectors.root.css({
                position: 'relative'
            });
            
            obj.$selectors.slides = obj.$selectors.root.children().css({
                position: 'absolute',
                top: -99999,
                right: -99999,
                bottom: -99999,
                left: -99999,
                width: 'auto',
                margin: 'auto',
                opacity: 0
            });
            
            if (obj.settings.reverse)
                obj.current_slide = obj.$selectors.slides.length - 1;
            
            obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').css({
                opacity: 1
            });
            
            obj.$selectors.root.height(obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').outerHeight());
            
            if (obj.settings.use_css_animations) {
                obj.$selectors.root.css({
                    transition: 'height ' + (obj.settings.anim_time / 1000) + 's ' + obj.settings.anim_style
                });

                obj.$selectors.slides.css({
                    transition: 'opacity ' + (obj.settings.anim_time / 1000) + 's ' + obj.settings.anim_style
                });
            }
        }
        
        this.next = function(){
            obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').css({
                opacity: 0
            });
            
            obj.current_slide++;
            
            if (obj.current_slide > (obj.$selectors.slides.length - 1))
                obj.current_slide = 0;
            
            obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').css({
                opacity: 1
            });
            
            obj.$selectors.root.height(obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').outerHeight());
        };
        
        this.prev = function(){
            obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').css({
                opacity: 0
            });
            
            if (obj.current_slide === 0)
                obj.current_slide = obj.$selectors.slides.length - 1;
            else
                obj.current_slide--;
            
            obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').css({
                opacity: 1
            });
            
            obj.$selectors.root.height(obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').outerHeight());
        };
        
        this.start = function(){
            if (_.t)
                this.stop();
            
            _.t = setInterval(function(){
                if (obj.settings.reverse)
                    obj.prev();
                else
                    obj.next();
            }, obj.settings.delay || obj.defaults.delay);
        };
        
        this.stop = function(){
            clearInterval(_.t);
            _.t = null;
        };

        function _startEventListeners() {
            if (obj.settings.stop_on_click) {
                obj.$selectors.slides.on(CONST.EVENT.CLICK, function(){
                    if (_.t)
                        obj.stop();
                    else
                        obj.start();
                });
            }
            
            obj.$selectors.window.on(CONST.EVENT.RESIZE, function(){
                obj.$selectors.root.height(obj.$selectors.slides.filter(':eq(' + obj.current_slide + ')').outerHeight());
            });
        }

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