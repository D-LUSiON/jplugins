/**
 * TITLE: Plugin title
 * AUTHOR: Author name
 * VERSION: v1.0.0
 * COPYRIGHT: All rights reserved!
 * 
 * @author Author name
 * @version v1.0.0
 * @param {object} $ - jQuery
 * @param {object} window
 * @param {object} document
 * @returns {object}
 */
;(function($, window, document) {
    'use strict';
    var pluginName = 'pluginName',
        /**
         * @description <h2>Plugin version.</h2>First digit is a major release. If plugin is rewritten from scratch, major version is changed from v1 to v.2.<br/>Second digit is "stable release" when added new functionality.<br/>Third digit is minor release - bugfixes or minor changes to the code.
         * @type String
         */
        version = 'v1.0.0',
        /**
         * @description These plugins have to be loaded before this plugin is initialized. Each plugin is jQuery method so here should be listed method names as strings
         * @example ['pluginName_1', 'pluginName_2']
         * @type Array
         */
        dependancies = [],
        /**
         * Local namespace for the plugin
         * @type Object
         */
        local_namespace = {};
    
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
    local_namespace[pluginName] = function(element, options) {
        var obj = this;
        var defaults = {
            // default plugin language
            lang: 'en',
            /**
             * @description HTML templates used to build plugin
             * @type {object}
             * @example If the plugin have to show some value, it have to be defined in double square brackets - <strong>[[some_value]]</strong>
             * @example If there is plain text that have to be translated, the property name have to be surrounded with percent sign - <strong>%some_text%</strong>
             */
            templates: {
                example_template: '<div>%some_text% - [[some_value]]</div>'
            }
        };
        
        var _ = {
            $element: {
                root: $(element),
                body: $('body')
            },
            ie_lt_9: ($.browser.msie && parseFloat($.browser.version) > 9) || (!$.browser.msie && navigator.userAgent.indexOf('Trident') === -1),
            settings: $.extend(true, {}, defaults, options || {})
        };
        
        _.localization = window.Localization[pluginName][_.settings.lang];
        
        /**
         * @description Initialization method of the object
         * @returns {undefined}
         */
        var __construct = (function(){
            _startEventListeners();
            return this;
        })();
        
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
                    return text.replace(/\%(.*?)\%/gi, function($0, $1){
                        return window.Localization[pluginName][lang || _.settings.lang][$1] || '';
                    });
                }
            } else {
                return false;
            }
        }
        
        /**
         * @description Renders HTML template to be set as DOM elements
         * @param {string} template
         * @param {object} data
         * @returns {String|Boolean}
         */
        function _renderTemplate(template, data){
            if (template && data) {
                return _translate(
                    template.replace(/\[\[(.*?)\]\]/gi, function($0, $1){
                        return data[$1] || '';
                    })
                );
            } else
                throw new Error('Please, provide valid template AND data!');
        }
        
        /**
         * Starts events
         * @returns {undefined}
         */
        function _startEventListeners(){
            
        };
        
        /**
         * @description Returns current plugin version
         * @returns {string}
         */
        this.version = function(){
            return version;
        };
        
        /**
         * @description Returns current settings
         * @returns {object}
         */
        this.getSettings = function() {
            return _.settings;
        };
        
        /**
         * @description Sets an option
         * @example $('.some-selector').pluginName('some_option', 'option_value');
         * @example $('.some-selector').pluginName('some_option', { opt1: 1, opt2: 2: opt3: 'text_value'});
         * @param {string|object} option
         * @param {string|number|array|object} value
         * @returns {object} jQuery selector or error
         */
        this.setSettings = function(option, value) {
            switch (typeof option) {
                case 'string':
                    if (option && value) {
                        var new_options = {};
                        new_options[option] = value;
                        _.settings = $.extend(true, {}, _.settings, new_options || {});
                        return _.$element.root;
                    } else 
                        throw new Error('Please, provide valid option to change and its value or the whole settings object!');
                    break;
                case 'object':
                    _.settings = $.extend(true, {}, _.settings, option || {});
                    return _.$element.root;
                    break;
                default: 
                    throw new Error('Please, provide valid option to change and its value or the whole settings object!');
                    break;
            }
        };
        
        // Initialization of the main object
        __construct();
    };
    
    $.fn[pluginName] = function(options, parameters) {
        
        var all_dependancies_loaded = true;
        var missing_dependancies = [];
        
        // Checking for dependant plugins
        if (dependancies.length > 0) {
            $.each(dependancies, function(i, val){
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
            this.each(function() {
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
            throw new Error(pluginName + ' needs these jQuery plugin(s) to be loaded: ' + missing_dependancies.join(', '));
        }
    };
})(jQuery, window, document);