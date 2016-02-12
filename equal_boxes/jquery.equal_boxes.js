/**
 * TITLE: Equal Boxes plugin
 * AUTHOR: D-LUSiON
 * VERSION: v1.1.0
 * COPYRIGHT: MIT License
 * 
 */
;(function($, window, document) {
    'use strict';
    var pluginName = 'boxes',
        version = 'v1.1.0',
        dependancies = [],
        local_namespace = {};
    
    if (typeof window.Localization === 'undefined')
        window.Localization = {};
        
    window.Localization[pluginName] = {
        en: {},
        bg: {}
    };
    
    local_namespace[pluginName] = function(element, options) {
        var obj = this;
        var defaults = {
            box_selector: '.box',
            calc_by_row: true,
            preload_images: true,
            onBeforeCalculate: function() {
            },
            onAfterCalculate: function() {
            }
        };
        
        var _ = {
            $elements: {
                window: $(window),
                body: $('body'),
                root: $(element),
                boxes: null,
                all_images: null
            },
            ie_lt_9: ($.browser.msie && parseFloat($.browser.version) > 9) || (!$.browser.msie && navigator.userAgent.indexOf('Trident') === -1),
            settings: $.extend(true, {}, defaults, options || {})
        };
        
        _.localization = window.Localization[pluginName][_.settings.lang];
        
        this.min_height = 0;
        this.boxes_on_row = 0;
        this.rows = 0;
        this.images_loaded = false;
        
        function __construct(){
            _.$elements.boxes = _.$elements.root.children(_.settings.box_selector);
            _.$elements.all_images = _.$elements.root.find('img');
            _startEventListeners();
            obj.calculateBoxes();
        };
        
        this.calculateBoxes = function() {
            if (_.$elements.all_images.length > 0 && !obj.images_loaded) {
                var img_index = 0;
                _.$elements.all_images.each(function(){
                    var im = new Image();
                    im.onload = function(){
                        img_index++;
                        if (img_index === _.$elements.all_images.length) {
                            obj.images_loaded = true;
                            _.$elements.body.trigger('images_loaded');
                        }
                    };
                    im.src = this.src;
                });
            } else if (obj.images_loaded){
                _.$elements.body.trigger('images_loaded');
            } else {
                obj.images_loaded = true;
                _.$elements.body.trigger('images_loaded');
            }
        };

        function _calculateHeight() {
            _.$elements.boxes.each(function() {
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
                    if (i_box < _.$elements.boxes.length) {
                        var $this = $(_.$elements.boxes.get(i_box));
                        if ($this.outerHeight() > obj.min_height[row])
                            obj.min_height[row] = $this.outerHeight();
                    }
                }
            }
        }

        function _setHeight() {
            if (typeof obj.min_height === 'object') {
                var i_box = 0;
                for (var row = 0; row < obj.rows; row++) {
                    var boxes_on_this_row = i_box + obj.boxes_on_row;
                    for (i_box; i_box < boxes_on_this_row; i_box++)
                        if (i_box < _.$elements.boxes.length)
                            $(_.$elements.boxes.get(i_box)).css('height', obj.min_height[row]);
                }
            } else
                _.$elements.boxes.css('height', obj.min_height);
        }
        
        function _startEventListeners(){
            _.$elements.body.on('images_loaded', function() {
                obj.boxes_on_row = Math.floor(_.$elements.root.outerWidth() / _.$elements.boxes.outerWidth());
                obj.rows = Math.ceil(_.$elements.boxes.length / obj.boxes_on_row);
                _.settings.onBeforeCalculate(_.$elements.root, _.$elements.boxes);
                if (_.settings.calc_by_row)
                    _calculateHeightByRow();
                else
                    _calculateHeight();
                _setHeight();
                _.settings.onAfterCalculate(_.$elements.root, _.$elements.boxes);
            });
            
            _.$elements.window.on('resize', function() {
                obj.calculateBoxes();
            }).on('load', function() {
                setTimeout(function() {
                    obj.calculateBoxes();
                }, 250);
            });
        };
        
        function _unbindEventListener() {
            $(window).off('resize').off('load');
        }
        
        this.version = function(){
            return version;
        };
        
        this.getSettings = function() {
            return _.settings;
        };
        
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
        
        __construct();
    };
    
    $.fn[pluginName] = function(options, parameters) {
        
        var all_dependancies_loaded = true;
        var missing_dependancies = [];
        
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
            
            this.each(function() {
                var $this = $(this),
                    data = $this.data(pluginName);

                if (!data || typeof data === 'undefined') {
                    var instance = new local_namespace[pluginName](this, options);
                    $this.data(pluginName, instance);
                } else {
                    if (typeof options === 'string' && typeof data[options] === 'function')
                        result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                    else
                        throw new Error(pluginName + ' method "' + options + '" not found!');
                }
            });
            
            return result || this;
        } else {
            throw new Error(pluginName + ' needs these jQuery plugin(s) to be loaded: ' + missing_dependancies.join(', '));
        }
    };
})(jQuery, window, document);

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