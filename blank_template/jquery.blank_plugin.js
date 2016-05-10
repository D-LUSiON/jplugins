/**
 * TITLE: jQuery blank template plugin with AMD and localization support 
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.2
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 * 
 * @author D-LUSiON
 * @version v1.0.2
 * @param {object} $ - jQuery
 * @param {object} window
 * @param {object} document
 * @returns {object}
 */

/**
 * Changelog:
 * 
 * v1.0.2:
 * - Small fix when getting/setting settings;
 * - Fix on translating texts;
 * - "Translate" method moved as public method;
 * - "renderTemplate" method moved as public method;
 * - Changed translatable text start and stop enclosures;
 * 
 * v1.0.1:
 * - Added local constants variable;
 * - Added AMD support for RequireJS;
 * - General purpose methods moved as prototype;
 * - Plugin DOM selectors and settings moved as public properties instead of private;
 * 
 * v1.0.0:
 * - Initial build
 */

;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            // list here all dependant objects for RequireJS
            'jQuery',
            'jQuery.ui' // remove if you don't need jQuery UI to be loaded
        ], factory);
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
}(function ($) {
    'use strict';
    var pluginName = 'blank_plugin',
        /**
         * @description <h2>Plugin version.</h2>First digit is a major release. If plugin is rewritten from scratch, major version have to be changed from v1 to v.2.<br/>Second digit is major release when removed or added new functionality.<br/>Third digit is minor release - bugfixes or minor changes to the code.
         * @type String
         */
        version = 'v1.0.2',
        /**
         * @description These plugins have to be loaded before this plugin is initialized. Each plugin is jQuery method so here should be listed method names as strings
         * @example ['pluginName_1', 'pluginName_2']
         * @type Array
         */
        dependancies = [],
        /**
         * @description Local namespace for the plugin
         * @type Object
         */
        local_namespace = {},
        
        /**
         * @description Put here all constants
         * @type Object
         */
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
            escapeSpecialChars: function(){
                this.replace(CONST.REGEXP.ESCAPE_SPECIAL_CHARACTERS, '\\$&');
            }
        });
    
    // Initializing localization if global object is not defined yet
    if (typeof window.Localization === CONST.DATA_TYPE.UNDEFINED) window.Localization = {};
    
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
    
    // Localization for the plugin
    window.Localization[pluginName] = {
        'en-US': {},
        'bg-BG': {}
    };

    /**
     * Main Class of the plugin
     * 
     * @param {DOM} element
     * @param {object} options
     * @returns {undefined}
     */
    local_namespace[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            // default plugin localization language
            lang: 'en-US',
            /**
             * @description HTML templates used to build plugin
             * @type {object}
             * @example If the plugin have to show some value, it must be defined in double square brackets - <strong>[[some_value]]</strong>
             * @example If there is plain text that have to be translated, the property name must be surrounded with percent sign - <strong>%some_text%</strong>
             */
            templates: {
                example_template: '<div>|%some_translatable_text%| - [[some_value]]</div>'
            }
        };
        
        /**
         * @description Selectors of DOM objects that plugin is using
         * @type {object}
         */
        this.$selectors = {
            root: $(element),
            body: $(CONST.SELECTOR.BODY)
        };
        
        /**
         * @description Settings, that plugin is going to use
         * @type {object}
         */
        this.settings = $.extend(true, {}, this.defaults, options || {});
        
        /**
         * @description Plugin localization
         * @type Object
         */
        this.localization = window.Localization[pluginName][this.settings.lang || window.navigator.language];
        
        /**
         * @description Plugin private variables
         * @type {object}
         */
        var _ = {
            /*
             * @description Example variable - is browser later than IE9
             */
            ie_lt_9: ($.browser.msie && parseFloat($.browser.version) > 9) || (!$.browser.msie && window.navigator.userAgent.indexOf('Trident') === -1)
        };

        /**
         * @description Initialization method of the object<br/><i>It's a private method so that nothing can access it</i>
         * @returns {object} Plugin class instance
         */
        function __construct() {
            _startEventListeners();
            return obj;
        }

        /**
         * @description Starts event listeners
         * @returns {undefined}
         */
        function _startEventListeners() {}
        
        /**
         * @description If you want your plugin to have the enable/disable functionality, fill in these methods, else - just delete them
         * @returns {object} Plugin instance
         */
        this.enable = function(){
            return this;
        };
        
        /**
         * @description Same desription as the "enable" method
         * @returns {object} Plugin instance
         */
        this.disable = function(){
            return this;
        };
        
        /**
         * @description It's a good idea to have a "destroy" method, that returns everythig as it was before initializing the plugin. If you don't need id, just remove this method
         * @returns {object} jQuery selector of the element that plugin is initialized on (for chaining purposes)
         */
        this.destroy = function(){
            this.$selectors.root.removeData(pluginName);
            return this.$selectors.root;
        };

        // Initialization
        __construct();
    };


    /**
     * General purpose methods
     * 
     * @returns {object}
     */
    local_namespace[pluginName].prototype = {
        /**
         * @description Method used to translate template into some language
         * @example ...write example here...
         * @param {string} text
         * @param {object} custom_values
         * @param {string} lang
         * @returns {string}
         */
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
                            // if text that is translated exists
                            return window.Localization[pluginName][lang || that.settings.lang || window.navigator.language][$1];
                        else
                            // if text not exists it's used the default language text
                            return window.Localization[pluginName][lang || that.defaults.lang][$1] || CONST.EMPTY_STRING;
                    });
                }
            } else {
                if (window.console && console.error)
                    console.error(window.Localization.global.text_not_provided);
                return false;
            }
        },
        
        /**
         * @description Renders HTML template to be set as DOM element
         * @example ...write example here...
         * @param {string} template
         * @param {object} data
         * @returns {string}
         */
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
        
        /**
         * @description Returns current plugin version
         * @returns {string}
         */
        version: function () {
            return version;
        },

        /**
         * @description Returns current settings
         * @param {string} property Property name
         * @returns {mixed|object}
         */
        getSettings: function (property) {
            if (property && typeof property === CONST.DATA_TYPE.STRING)
                return this.settings[property];
            else
                return this.settings;
        },

        /**
         * @description Sets an option
         * @example $('.some-selector').pluginName('setSettings', 'some_option', 'option_value');
         * @example $('.some-selector').pluginName('setSettings', 'some_option', { opt1: 1, opt2: 2: opt3: 'text_value'});
         * @param {string|object} option
         * @param {string|number|array|object} value
         * @returns {object} jQuery selector or error
         */
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

            // Checking for other plugins that this plugin depends on
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

                // Creating instance for each selector
                this.each(function () {
                    var $this = $(this),
                        data = $this.data(pluginName);

                    if (!data || typeof data === CONST.DATA_TYPE.UNDEFINED) {
                        // If plugin is not initialized, an instance is created and is set as data to the selector
                        var instance = new local_namespace[pluginName](this, options);
                        $this.data(pluginName, instance);
                    } else {
                        // if the plugin is already initialized you can pass public method name and arguments
                        // Example: $('.some-selector').pluginName('getSettings') - returns object with the currently used settings
                        // Example: $('.some-selector').pluginName('setSettings', 'setting_name', 'setting_value') - sets 'setting_name' with value of 'setting_value'
                        if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] === CONST.FUNCTION)
                            result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                        else if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] !== CONST.FUNCTION) {
                            if (window.console && console.error)
                                console.error(data.renderTemplate(window.Localization.global.method_not_found, { pluginName: pluginName, method: options }));
                        } else if (typeof options === CONST.DATA_TYPE.STRING)
                            data.setSettings(options, args);
                        else if (typeof options === CONST.DATA_TYPE.UNDEFINED)
                            if (window.console && console.error)
                                console.error(data.renderTemplate(window.Localization.global.already_initialized, { pluginName: pluginName }));
                    }
                });

                // returns the jquery selector for preserving chain or returns result from method
                return result || this;
            } else {
                throw new Error(pluginName + window.Localization.global.plugins_needed + missing_dependancies.join(',\n'));
            }
        };
    else
        if (window.console && console.error)
            console.error('Plugin with the name "' + pluginName + '" is already initialized as part of jQuery!');
}));