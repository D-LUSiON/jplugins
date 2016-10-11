/**
 * TITLE: jQuery Wyssi front-end framework
 * AUTHOR: D-LUSiON
 * VERSION: v0.0.1 - alpha
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 * 
 * @param {function} factory
 * @returns {undefined}
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
    
    window.CONST = {
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
    
    var Translations = function(){
        var _this = this;
        function __construct(){
            console.log('initializing translations...');
            return {
                'blabla alabala': 'блабла алабала'
            };
        }
        
        return __construct();
    };
    
    var Wyssi = function () {
        var _this = this;
        
        var _ = {
            self: $('div')
        };
        
        this.extensions = {};
        
        this.pluginsClasses = {};
        
        function __construct(){
            _this.initTranslations();
        }
        
        this.initTranslations = function(){
            this.translations = new Translations();
            console.log('translations initialized!');
        };
        
        this.registerPlugin = function(plugin_class, plugin_options){
            if (plugin_options.pluginName) {
                if (!(plugin_options.pluginName in this.pluginsClasses)) {
                    this.pluginsClasses[plugin_options.pluginName] = plugin_class;
                    __extendPlugin(this.pluginsClasses[plugin_options.pluginName]);
                    __initAsJqueryPlugin(this.pluginsClasses[plugin_options.pluginName]);
                } else
                    if (window.console && console.error)
                        console.error('Plugin "' + plugin_options.pluginName + '" is already registered as part of Wyssi.tools');
            } else {
                if (window.console && console.error) {
                    console.error('Please, provide valid name for the plugin!');
                }
            }
        };
        
        function __extendPlugin(plugin) {
            plugin.prototype = {
                translate: function (text, custom_values, lang) {
                    var self = this;
                },
                renderTemplate: function (template, data) {
                    var self = this;
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
        }
        
        function __initAsJqueryPlugin(plugin) {
            // add $.fn[plugin]
        }
        
        __construct();
    };
    
    if (window.Wyssi) {
        if (window.console && console.error)
            console.error('Wyssi tools already initialized!');
        return;
    }
    
    window.Wyssi = new Wyssi();
    
}));