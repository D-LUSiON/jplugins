/**
 * TITLE: Tabs plugin
 * AUTHOR: Lubomir Peikov @ Web Fashion ltd.
 * VERSION: v1.1.1
 * COPYRIGHT: All rights reserved!
 * 
 * @param {object} $ - jQuery
 * @param {object} window
 * @param {object} document
 * @returns {object}
 */
;(function($, window, document) {
    'use strict';
    var pluginName = 'tabs',
        version = 'v1.1.1',
        dependancies = [],
        local_namespace = {};
    
    if (typeof window.Localization === 'undefined')
        window.Localization = {};
        
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
            lang: 'en',
            disabled: false,
            ajax_load: false,
            change_tabs_only: false,
            normal_load: false,
            updateOnResize: false,
            vertical: false,
            fixContentSize: true, // когато са вертикални, да прави съдържанието по цялата височина
            classes: {
                disabled: 'disabled',
                ajax_load: 'ajax_load',
                change_tabs_only: 'change_tabs_only',
                normal_load: 'normal_load',
                current: 'current',
                container: 'tabs',
                vertical: 'vertical',
                tabs_container: 'tabs-container',
                tab: 'tab',
                tab_disabled: 'disabled',
                tabs_content_container: 'tabs-content_container',
                tabs_content: 'tab-content',
                pagination_item: 'tabs-controlls-pagination_item'
            },
            html: {
                loadingHtml: '<div class="ajax-loading"/>',
                fade_left: '<div class="tabs-fade left"/>',
                fade_right: '<div class="tabs-fade right"/>',
                tabs_mover: '<div class="tabs-container-mover"/>',
                tabs_controlls: '<div class="tabs-controlls"/>',
                tabs_pagination: '<div class="tabs-controlls-pagination"/>',
                controlls_left: '<div class="tabs-controlls-arrow left"><span class="fa fa-angle-double-left"></span></div>',
                controlls_right: '<div class="tabs-controlls-arrow right"><span class="fa fa-angle-double-right"></span></div>',
                controlls_item: '<div class="tabs-controlls-pagination_item"/>',
                content_overlay: '<div class="tabs-content_overlay"/>'
            },
            closeOnClickActive: false,
            extTrigger: null,
            beforeSend: function() {},
            onTabChange: function() {},
            onDataLoaded: function() {}
        };
        var settings = $.extend(defaults, options || {});
        var _ = {
            $elements: {
                root: $(element),
                tabs_container: null,
                tabs: null,
                current_tab: null,
                contents: null,
                current_content: null,
                fade_left: null,
                fade_right: null,
                tabs_mover: null,
                tabs_controlls: null,
                tabs_pagination: null,
                controlls_left: null,
                controlls_right: null,
                controlls_item: null
            },
            tabs_container_width: null,
            tabs_width: null,
            controlls_width: null
        };
        this.url = null;
        this.current_tab = {
            index: null,
            href: null,
            title: ''
        };

        function __construct() {
            _getElements();
            _getTabsWidth();
            if (settings.vertical && settings.fixContentSize) {
                _setVerticalHeight();
            }
            if (window.location.hash && window.location.hash !== '') {
                obj.changeTab(window.location.hash);
            }
            _eventListener();
        }

        function _getElements() {
            _.$elements.tabs_container = _.$elements.root.find('.' + settings.classes.tabs_container);
            _.$elements.tabs = _.$elements.root.find('.' + settings.classes.tab);
            _.$elements.current_tab = _.$elements.tabs.filter('.' + settings.classes.tab + '.' + settings.classes.current);
            if (settings.extTrigger != null) {
                if (typeof settings.extTrigger == 'string' && settings.extTrigger != '') {
                    _.$elements.ext_trigger = $(settings.extTrigger);
                } else if (typeof settings.extTrigger == 'object') {
                    _.$elements.ext_trigger = settings.extTrigger;
                }
            }

            _.$elements.content_container = _.$elements.root.find('.' + settings.classes.tabs_content_container);
            _.$elements.contents = _.$elements.content_container.children('.' + settings.classes.tabs_content);
            _.$elements.current_content = _.$elements.content_container.filter('.' + settings.classes.tabs_content + '.' + settings.classes.current);
            settings.vertical = (options && options.vertical) ? options.vertical : _.$elements.root.hasClass(settings.classes.vertical);
            settings.disabled = (options && options.disabled) ? options.disabled : _.$elements.root.hasClass(settings.classes.disabled);
            settings.ajax_load = _.$elements.root.hasClass(settings.classes.ajax_load);
            settings.change_tabs_only = _.$elements.root.hasClass(settings.classes.change_tabs_only);
            settings.normal_load = _.$elements.root.hasClass(settings.classes.normal_load);
        }

        function _getTabsWidth() {
            _.tabs_container_width = _.$elements.tabs_container.outerWidth();
            _.tabs_width = 0;
            _.$elements.tabs.each(function() {
                _.tabs_width += $(this).outerWidth() + 1;
            });
            if (_.tabs_width >= _.tabs_container_width && !settings.vertical) {
                _appendPagination();
            } else {
                _destroyPagination();
            }
        }

        function _getTabsMaxHeight() {
            var height = 0;
            _.$elements.tabs.each(function() {
                if (height < $(this).outerHeight()) {
                    height = $(this).outerHeight();
                }
            });
            return height;
        }

        function _appendPagination() {
            if (_.$elements.fade_left == null) {
                _.$elements.fade_left = $(settings.html.fade_left).appendTo(_.$elements.tabs_container).hide();
                _.$elements.tabs_mover = $(settings.html.tabs_mover).appendTo(_.$elements.tabs_container).css('width', _.tabs_width + 10);
                _.$elements.tabs.appendTo(_.$elements.tabs_mover);
                _.$elements.tabs_controlls = $(settings.html.tabs_controlls).appendTo(_.$elements.tabs_container);
                _.$elements.fade_right = $(settings.html.fade_right).appendTo(_.$elements.tabs_controlls);
                _.$elements.tabs_pagination = $(settings.html.tabs_pagination).appendTo(_.$elements.tabs_controlls);
                _.$elements.controlls_left = $(settings.html.controlls_left).appendTo(_.$elements.tabs_pagination);
                _.$elements.controlls_left.addClass(settings.classes.disabled);
                for (var i = 0; i < (_.tabs_width / _.tabs_container_width); i++) {
                    $(settings.html.controlls_item).appendTo(_.$elements.tabs_pagination);
                }
                _.$elements.controlls_item = _.$elements.tabs_pagination.find('.' + settings.classes.pagination_item);
                _.$elements.controlls_item.filter(':first').addClass(settings.classes.current);
                _.$elements.controlls_right = $(settings.html.controlls_right).appendTo(_.$elements.tabs_pagination);
                _.controlls_width = _.$elements.tabs_controlls.outerWidth();
                _.view_width = _.$elements.tabs_container.outerWidth() - _.controlls_width;
                var diff = (_.$elements.current_tab.length > 0) ? (_.view_width - (_.$elements.current_tab.position().left + _.$elements.current_tab.outerWidth())) : 0;
                if (diff < 0) {
                    _.$elements.tabs_mover.css('left', diff);
                    _.$elements.fade_left.show();
                    _.$elements.controlls_left.removeClass(settings.classes.disabled);
                }
                _.$elements.tabs_container.height(_getTabsMaxHeight());
                _startPaginationEventListener();
            }
        }

        function _destroyPagination() {
            if (_.$elements.fade_left !== null) {
                _stopPaginationEventListener();
                _.$elements.fade_left.remove();
                _.$elements.fade_left = null;
                _.$elements.tabs.unwrap(settings.html.tabs_mover);
                _.$elements.tabs_controlls.empty().remove();
                _.$elements.tabs_controlls = null;
            }
        }

        function _setVerticalHeight() {
            var $container = _.$elements.root.parent();
            _.$elements.content_container.css('min-height', $container.height());
            _.$elements.content_overlay = $(settings.html.content_overlay).insertBefore(_.$elements.content_container);
        }

        function _getUrlData($elem, callback) {
            $.ajax({
                url: obj.url,
                beforeSend: function() {
                    _.$elements.tabs.removeClass(settings.classes.current);
                    $elem.addClass(settings.classes.current);
                    _.$elements.current_content.html(settings.html.loadingHtml);
                    settings.beforeSend();
                },
                success: function(returned) {
                    try {
                        returned = JSON.parse(returned);
                    } catch (err) {
                        if (window.console && console.error) {
                            console.error(err);
                        }
                        _.$elements.current_content.css('background', 'red');
                        _.$elements.current_content.html(returned);
                    }
                    if (typeof callback === 'function')
                        callback(returned);
                }
            });
        }

        function _setCurrentTab($elem) {
            _.$elements.tabs.removeClass(settings.classes.current);
            $elem.addClass(settings.classes.current);
            obj.current_tab = {
                index: $elem.index(),
                href: $elem.attr('href'),
                title: $elem.text()
            };
        }
        
        this.changeTab = function(hash){
            hash = (hash.indexOf('#') === -1)? ('#' + hash) : hash;
            var $tab = _.$elements.tabs.filter('[href="'+hash+'"]');
            if ($tab.length === 0 && window.console && console.error) {
                console.error('Hash not found!');
                return;
            }
            _setCurrentTab($tab);
            _setCurrentTabContent($tab);
            _.$elements.root.trigger('tab_change', [$tab.attr('href')]);
            settings.onTabChange($tab.attr('href'));
        };

        function _setCurrentTabContent($elem) {
            var url = $elem.attr('href');
            _.$elements.contents.removeClass(settings.classes.current);
            $(url).addClass(settings.classes.current);
        }
        
        this.getCurrent = function(){
            return obj.current_tab;
        };
        
        this.destroy = function(){
            _.$elements.root.removeData(pluginName);
            _.$elements.tabs.off('click');
            if (_.$elements.ext_trigger)
                _.$elements.ext_trigger.off('click');
            _.$elements.root.off('dataLoaded');
            if (settings.updateOnResize)
                $(window).off('resize');
        };

        function _eventListener() {
            if (!settings.normal_load) {
                _.$elements.tabs.on('click', function(e) {
                    var $this = $(this);
                    if ($this.hasClass(settings.classes.disabled) || $this.hasClass(settings.classes.current)) {
                        e.preventDefault();
                    } else {
                        if (settings.change_tabs_only) {
                            e.preventDefault();
                            _setCurrentTab($this);
                        } else if (settings.ajax_load) {
                            e.preventDefault();
                            obj.url = $this.attr('href');
                            _getUrlData($this, function(data) {
                                _.$elements.root.trigger('dataLoaded', data);
                            });
                        } else if (!settings.disabled && !$this.hasClass(settings.classes.disabled) && !$this.hasClass(settings.classes.current)) {
                            e.preventDefault();
                            _setCurrentTab($this);
                            _setCurrentTabContent($this);
                        }
                        _.$elements.root.trigger('tab_change', [$this.attr('href')]);
                        settings.onTabChange($this.attr('href'));
                    }
                });

                if (_.$elements.ext_trigger) {
                    _.$elements.ext_trigger.on('click', function(e) {
                        var $this = $(this);
                        var $e_target = $(e.target);
                        _.$elements.ext_trigger.removeClass(settings.classes.current);
                        $this.addClass(settings.classes.current);
                        var $target = $($this.attr('data-href') || $this.attr('href') || $this.val());
                        _.$elements.contents.removeClass(settings.classes.current);
                        $target.addClass(settings.classes.current);
                    });
                }
                
                _.$elements.root.on('dataLoaded', function() {
                    settings.onDataLoaded();
                });
            } else {
                _.$elements.tabs.on('click', function(e){
                    var $this = $(this);
                    if ($this.hasClass(settings.classes.disabled) || $this.hasClass(settings.classes.current)) {
                        e.preventDefault();
                    } else {
                        _.$elements.root.trigger('tab_change', [$this.attr('href')]);
                        settings.onTabChange($this.attr('href'));
                    }
                });
            }
            if (settings.updateOnResize) {
                $(window).on('resize', function() {
                    _getTabsWidth();
                });
            }
        }

        function _startPaginationEventListener() {
            _.$elements.controlls_right.on('click', function() {
                if (!_.$elements.controlls_right.hasClass(settings.classes.disabled)) {
                    var $current_item = _.$elements.controlls_item.filter('.' + settings.classes.current);
                    _.$elements.controlls_item.removeClass(settings.classes.current);
                    $current_item.next().addClass(settings.classes.current);
                    _.$elements.controlls_right.addClass(settings.classes.disabled);
                    _.$elements.controlls_left.removeClass(settings.classes.disabled);
                    _.$elements.fade_left.show();
                    _.$elements.tabs_mover.animate({
                        left: -(_.tabs_width - (_.tabs_container_width - _.controlls_width))
                    });
                }
            });
            _.$elements.controlls_left.on('click', function() {
                if (!_.$elements.controlls_left.hasClass(settings.classes.disabled)) {
                    var $current_item = _.$elements.controlls_item.filter('.' + settings.classes.current);
                    _.$elements.controlls_item.removeClass(settings.classes.current);
                    $current_item.prev().addClass(settings.classes.current);
                    _.$elements.controlls_left.addClass(settings.classes.disabled);
                    _.$elements.controlls_right.removeClass(settings.classes.disabled);
                    _.$elements.fade_left.hide();
                    _.$elements.tabs_mover.animate({
                        left: 0
                    });
                }
            });
        }
        
        function _stopPaginationEventListener(){
            _.$elements.controlls_right.off('click');
            _.$elements.controlls_left.off('click');
        }

        __construct();
    
    };
    
    $.fn[pluginName] = function(options, parameters) {
        var all_dependancies_loaded = true;
        var missing_dependancies = [];
        
        if (dependancies.length > 0) {
            $.each(dependancies, function(i, val){
                if (typeof $.fn[val] === 'undefined') {
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