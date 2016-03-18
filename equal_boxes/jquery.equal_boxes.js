/**
 * TITLE: Equal Boxes plugin
 * AUTHOR: D-LUSiON
 * VERSION: v1.1.0
 * COPYRIGHT: MIT License
 * 
 */
;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
            'jQuery'
        ], factory);
    } else {
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    var pluginName = 'boxes',
        version = 'v1.2.0',
        dependancies = [],
        local_namespace = {},
        CONST = {
            LANG: {
                EN: 'en-US',
                BG: 'bg-BG'
            },
            SELECTOR: {
                BODY: 'body',
                IMAGE: 'img'
            },
            EVENT: {
                IMAGES_LOADED: 'images_loaded',
                LOAD: 'load',
                RESIZE: 'resize'
            },
            EMPTY_STRING: '',
            UNDEFINED: 'undefined',
            FUNCTION: 'function',
            STRING: 'string',
            OBJECT: 'object',
            IMAGE: 'image',
            VIDEO: 'video',
            HEIGHT: 'height',
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
    
    if (typeof window.Localization === CONST.UNDEFINED) {
        window.Localization = {
                global: {
                    already_initialized: '[[pluginName]] is already initialized!',
                    no_valid_option: 'Please, provide valid option to change and its value or the whole settings object!',
                    plugins_needed: ' needs these jQuery plugin(s) to be loaded: ',
                    method_not_found: '[[pluginName]] method "[[method]]" not found!',
                    text_not_provided: 'Please, provide text variable!',
                    no_template_and_data: 'Please, provide valid template AND data!'
                }
        };
    }
    
    window.Localization[pluginName] = {
        'en-US': {},
        'bg-BG': {}
    };
    
    local_namespace[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            box_selector: '.box',
            calc_by_row: true,
            preload_images: true,
            onBeforeCalculate: function() {},
            onAfterCalculate: function() {}
        };
        
        this.$selectors = {
            window: $(window),
            body: $(CONST.SELECTOR.BODY),
            root: $(element),
            boxes: null,
            all_images: null
        };
        
        this.settings = $.extend(true, {}, this.defaults, options || {});
        
        this.localization = window.Localization[pluginName][this.settings.lang || window.navigator.language];
        
        var _ = {};
        
        this.min_height = 0;
        this.boxes_on_row = 0;
        this.rows = 0;
        this.images_loaded = false;
        
        function __construct() {
            obj.$selectors.boxes = obj.$selectors.root.children(obj.settings.box_selector);
            obj.$selectors.all_images = obj.$selectors.root.find(CONST.SELECTOR.IMAGE);
            _startEventListeners();
            obj.calculateBoxes();
            return obj;
        }
        
        this.calculateBoxes = function() {
            if (obj.$selectors.all_images.length > 0 && !obj.images_loaded) {
                var img_index = 0;
                obj.$selectors.all_images.each(function(){
                    var im = new Image();
                    im.onload = function(){
                        img_index++;
                        if (img_index === obj.$selectors.all_images.length) {
                            obj.images_loaded = true;
                            obj.$selectors.body.trigger(CONST.EVENT.IMAGES_LOADED);
                        }
                    };
                    im.src = this.src;
                });
            } else if (obj.images_loaded){
                obj.$selectors.body.trigger(CONST.EVENT.IMAGES_LOADED);
            } else {
                obj.images_loaded = true;
                obj.$selectors.body.trigger(CONST.EVENT.IMAGES_LOADED);
            }
        };

        function _calculateHeight() {
            obj.$selectors.boxes.each(function() {
                var $this = $(this);
                if ($this.outerHeight() > obj.min_height)
                    obj.min_height = $this.outerHeight();
            });
        }

        function _calculateHeightByRow() {
            var i_box = 0;
            obj.min_height = [];
            for (var row = 0; row < obj.rows; row++) {
                var boxes_on_this_row = i_box + obj.boxes_on_row;
                obj.min_height[row] = 0;
                for (i_box; i_box < boxes_on_this_row; i_box++) {
                    if (i_box < obj.$selectors.boxes.length) {
                        var $this = $(obj.$selectors.boxes.get(i_box));
                        if ($this.outerHeight() > obj.min_height[row])
                            obj.min_height[row] = $this.outerHeight();
                    }
                }
            }
        }

        function _setHeight() {
            if (typeof obj.min_height === CONST.OBJECT) {
                var i_box = 0;
                for (var row = 0; row < obj.rows; row++) {
                    var boxes_on_this_row = i_box + obj.boxes_on_row;
                    for (i_box; i_box < boxes_on_this_row; i_box++)
                        if (i_box < obj.$selectors.boxes.length)
                            $(obj.$selectors.boxes.get(i_box)).css(CONST.HEIGHT, obj.min_height[row]);
                }
            } else
                obj.$selectors.boxes.css(CONST.HEIGHT, obj.min_height);
        }
        
        function _startEventListeners(){
            obj.$selectors.body.on(CONST.EVENT.IMAGES_LOADED, function() {
                obj.boxes_on_row = Math.floor(obj.$selectors.root.outerWidth() / obj.$selectors.boxes.outerWidth());
                obj.rows = Math.ceil(obj.$selectors.boxes.length / obj.boxes_on_row);
                obj.settings.onBeforeCalculate(obj.$selectors.root, obj.$selectors.boxes);
                if (obj.settings.calc_by_row)
                    _calculateHeightByRow();
                else
                    _calculateHeight();
                _setHeight();
                obj.settings.onAfterCalculate(obj.$selectors.root, obj.$selectors.boxes);
            });
            
            obj.$selectors.window.on(CONST.EVENT.RESIZE, function() {
                obj.calculateBoxes();
            }).on(CONST.EVENT.LOAD, function() {
                setTimeout(function() {
                    obj.calculateBoxes();
                }, 250);
            });
        };
        
        function _unbindEventListener() {
            obj.$selectors.window.off(CONST.EVENT.RESIZE).off(CONST.EVENT.LOAD);
        }
        
        this.enable = function(){
            return this;
        };
        
        this.disable = function(){
            return this;
        };
        
        this.destroy = function(){
            this.$selectors.root.removeData(pluginName);
            return this.$selectors.root;
        };
        
        __construct();
    };
    
    local_namespace[pluginName].prototype = {  
        translate: function(text, custom_values, lang){
            var that = this;
            if (text) {
                if (custom_values) {
                    return text.replace(CONST.REGEXP.EVERY_TRANSLATABLE_TEXT, function($0, $1){
                        return custom_values[$1] || $0;
                    });
                } else {
                    return text.replace(CONST.REGEXP.EVERY_TRANSLATABLE_TEXT, function ($0, $1) {
                        if (window.Localization[pluginName][lang || that.settings.lang || window.navigator.language][$1])
                            
                            return window.Localization[pluginName][lang || that.settings.lang || window.navigator.language][$1];
                        else
                            
                            return window.Localization[pluginName][lang || that.defaults.lang][$1] || CONST.EMPTY_STRING;
                    });
                }
            } else {
                if (window.console && console.error)
                    console.error(window.Localization.global.text_not_provided);
                return false;
            }
        },
        renderTemplate: function(template, data){
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
        getSettings: function () {
            return this.settings;
        },
        setSettings: function (option, value) {
            switch (typeof option) {
                case CONST.STRING:
                    if (option && value) {
                        var new_options = {};
                        new_options[option] = value;
                        this.settings = $.extend(true, {}, this.settings, new_options || {});
                        return this.$selectors.root;
                    } else
                        throw new Error(window.Localization.global.no_valid_option);
                    break;
                case CONST.OBJECT:
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
                    if (typeof $.fn[val] === CONST.UNDEFINED && typeof $[val] === CONST.UNDEFINED) {
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
                    if (!data || typeof data === CONST.UNDEFINED) {
                        var instance = new local_namespace[pluginName](this, options);
                        $this.data(pluginName, instance);
                    } else {
                        if (typeof options === CONST.STRING && typeof data[options] === CONST.FUNCTION)
                            result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                        else if (typeof options === CONST.STRING && typeof data[options] !== CONST.FUNCTION) {
                            if (window.console && console.error)
                                console.error(data.renderTemplate(window.Localization.global.method_not_found, { pluginName: pluginName, method: options }));
                        } else if (typeof options === CONST.STRING)
                            data.setSettings(options, args);
                        else if (typeof options === CONST.UNDEFINED)
                            if (window.console && console.error)
                                console.error(data.renderTemplate(window.Localization.global.already_initialized, { pluginName: pluginName }));
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

$(function() {
    $('.equal_boxes-container').boxes({
        box_selector: '.box',
        /**
         * Изчисляване минимална височина за всеки ред кутии.
         * 
         * Ако кутиите са с различна височина, може да се изчисляват ред по ред, така че ако има някъде някоя много висока, другите да нямат много празно място
         *  true - изчислява ред по ред минималната височина
         *  false - изчислява минималната височина за всички кутии
         */
        calc_by_row: true,
        // callback, който се изпълнява преди да изчисли стойностите
        // фунцкията подава като параметри контейнера, за който става въпрос, както и боксовете, които се съдържат в него
        onBeforeCalculate: function($container, $boxes) {
        },
        // callback, който се изпълнява след като изчисли стойностите
        onAfterCalculate: function($container, $boxes) {
        }
    });
});