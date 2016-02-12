/**
 * TITLE: jQuery blank template plugin with AMD and localization support 
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.1
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 * 
 * @author D-LUSiON
 * @version v1.0.1
 * @param {object} $ - jQuery
 * @param {object} window
 * @param {object} document
 * @returns {object}
 */

/**
 * Changelog:
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

(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'jquery.ui'
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
        version = 'v1.0.1',
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
        CONST = {};

    // Initializing localization if global object is not defined yet
    if (typeof window.Localization === 'undefined')
        window.Localization = {};

    // Localization for the plugin
    window.Localization[pluginName] = {
        en: {},
        bg: {}
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
            lang: 'en',
            /**
             * @description HTML templates used to build plugin
             * @type {object}
             * @example If the plugin have to show some value, it must be defined in double square brackets - <strong>[[some_value]]</strong>
             * @example If there is plain text that have to be translated, the property name must be surrounded with percent sign - <strong>%some_text%</strong>
             */
            templates: {
                example_template: '<div>%some_text% - [[some_value]]</div>'
            }
        };
        
        /**
         * @description Selectors of DOM objects that plugin is using
         * @type {object}
         */
        this.$selectors = {
            root: $(element),
            body: $('body')
        };
        
        /**
         * @description Settings, that plugin is going to use
         * @type {object}
         */
        this.settings = $.extend(true, {}, defaults, options || {});
        
        /**
         * @description Plugin localization
         * @type Object
         */
        this.localization = window.Localization[pluginName][this.settings.lang];
        
        /**
         * @description Plugin private variables
         * @type {object}
         */
        var _ = {
            /*
             * @description Example variable - is browser later than IE9
             */
            ie_lt_9: ($.browser.msie && parseFloat($.browser.version) > 9) || (!$.browser.msie && navigator.userAgent.indexOf('Trident') === -1)
        };

        /**
         * @description Initialization method of the object<br/><i>It's a private method so that nothing can access it</i>
         * @returns {object} Plugin class instance
         */
        function __construct() {
            _startEventListeners();
            return this;
        }

        /**
         * @description Method used to translate template into some language
         * @param {string} text
         * @param {string} custom_value
         * @param {string} custom_text
         * @param {string} lang
         * @returns {string}
         */
        function _translate(text, custom_value, custom_text, lang) {
            if (text) {
                if (custom_value && custom_text) {
                    return text.replace(new RegExp('%' + custom_value + '%', 'gi'), custom_text);
                } else {
                    return text.replace(/\%(.+?)\%/gi, function ($0, $1) {
                        if (window.Localization[pluginName][lang || obj.settings.lang][$1])
                            // if text that is translated exists
                            return window.Localization[pluginName][lang || obj.settings.lang][$1];
                        else
                            // if text not exists it's used the default language text
                            return window.Localization[pluginName][lang || obj.defaults.lang][$1] || '';
                    });
                }
            } else {
                return false;
            }
        }

        /**
         * @description Renders HTML template to be set as DOM element
         * @param {string} template
         * @param {object} data
         * @returns {String|Boolean}
         */
        function _renderTemplate(template, data) {
            if (template && data) {
                return _translate(
                            template.replace(/\[\[(.+?)\]\]/gi, function ($0, $1) {
                                return data[$1] || '';
                            })
                        );
            }
            
            throw new Error('Please, provide valid template AND data!');
            return false;
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
         * @description Returns current plugin version
         * @returns {string}
         */
        version: function () {
            return version;
        },

        /**
         * @description Returns current settings
         * @returns {object}
         */
        getSettings: function () {
            return this.settings;
        },

        /**
         * @description Sets an option
         * @example $('.some-selector').pluginName('some_option', 'option_value');
         * @example $('.some-selector').pluginName('some_option', { opt1: 1, opt2: 2: opt3: 'text_value'});
         * @param {string|object} option
         * @param {string|number|array|object} value
         * @returns {object} jQuery selector or error
         */
        setSettings: function (option, value) {
            switch (typeof option) {
                case 'string':
                    if (option && value) {
                        var new_options = {};
                        new_options[option] = value;
                        this.settings = $.extend(true, {}, this.settings, new_options || {});
                        return _.$element.root;
                    } else
                        throw new Error('Please, provide valid option to change and its value or the whole settings object!');
                    break;
                case 'object':
                    this.settings = $.extend(true, {}, this.settings, option || {});
                    return _.$element.root;
                    break;
                default:
                    throw new Error('Please, provide valid option to change and its value or the whole settings object!');
                    break;
            }
        }
    };

    $.fn[pluginName] = function (options, parameters) {

        var all_dependancies_loaded = true,
            missing_dependancies = [];

        // Checking for other plugins that this plugin depends on
        if (dependancies.length > 0) {
            $.each(dependancies, function (i, val) {
                if (typeof $.fn[val] === 'undefined' && typeof $[val] === 'undefined') {
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

                if (!data || typeof data === 'undefined') {
                    // If plugin is not initialized, an instance is created and is set as data to the selector
                    var instance = new local_namespace[pluginName](this, options);
                    $this.data(pluginName, instance);
                } else {
                    // if the plugin is already initialized you can pass public method name and arguments
                    // Example: $('.some-selector').pluginName('getSettings') - returns object with the currently used settings
                    // Example: $('.some-selector').pluginName('setSettings', 'setting_name', 'setting_value') - sets 'setting_name' with value of 'setting_value'
                    if (typeof options === 'string' && typeof data[options] === 'function')
                        result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                    else
                        throw new Error(pluginName + ' method "' + options + '" not found!');
                }
            });

            // returns the jquery selector for preserving chain or returns result from method
            return result || this;
        } else {
            throw new Error(pluginName + ' needs these jQuery plugin(s) to be loaded: ' + missing_dependancies.join(',\n'));
        }
    };
}));