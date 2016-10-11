;
(function (factory) {
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
    
    if (!window.Wyssi) {
        throw new Error('Wyssi.tools MUST be initialized BEFORE loading plugins!');
        return false;
    }
        
    var NS = {},
        plugin_options = {
            pluginName: 'blank_plugin',
            dependancies: []
        };
    
    NS[plugin_options.pluginName] = function (element, options) {
        var self = this;
        
        this.defaults = {};
    
        this.settings = $.extend(true, {}, this.defaults, options || {});
        
        function __contruct(){
            console.log('Plugin ""' + plugin_options.pluginName + '" initialized!');
        }
        
        __contruct();
    };
    
    window.Wyssi.registerPlugin(NS[plugin_options.pluginName], plugin_options);
}));