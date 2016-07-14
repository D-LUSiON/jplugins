/**
 * TITLE: jQuery tabs2 plugin with AMD and localization support 
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.0
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 */

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
    var pluginName = 'tabs2',
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
                ELEMENTS: {
                    ALL: '*',
                    DIV: '<div/>'
                },
                CHAR: {
                    DASH: '-',
                    HASH: '#'
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
                    HREF: 'href',
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

    if (!String.isUrl)
        $.extend(String.prototype, {
            isUrl: function () {
                return /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(this);
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
                provide_valid_selector: 'Please, provide valid ID selector!'
            }
        },
        'bg-BG': {}
    };

    NS[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            lang: 'en-US',
            templates: {
                tabs_wrapper: '<div class="tabs-wrapper"/>',
                tabs_contols: '<div class="tabs-controls"/>',
                menu_current_tab: '<div class="tab menu-tab">[[title]]</div>',
                controls: {
                    left: '<span class="fa fa-chevron-left" data-role="[[scroll_left]]"/>',
                    dot: '<span class="fa fa-circle"/>',
                    right: '<span class="fa fa-chevron-right" data-role="[[scroll_right]]"/>'
                },
                menu: '<div class="tabs-menu fa fa-bars"/>',
                example_template: '<div>|%some_translatable_text%| - [[some_value]]</div>'
            },
            vertical: false,
            reverse_scroll: false,
            responsive_scroller: true,
            menu_close_on_click: true,
            tab_content_ajax: false,
            allow_add_tab: false,
            actions: {
                scroll_left: 'scroll-left',
                scroll_right: 'scroll-right'
            },
            classes: {
                vertical: 'vertical',
                menu: 'menu',
                current: 'current',
                fade_front: 'fade_before',
                disabled: 'disabled',
                opened: 'opened'
            },
            selectors: {
                tabs_container: '.tabs-container',
                tabs: '.tab',
                contents_container: '.tabs-content_container',
                content: '.tab-content'
            },
            onTabClick: function () {}
        };

        this.$selectors = {
            root: $(element),
            body: $(CONST.SELECTOR.BODY),
            window: $(window)
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});

        var _ = {};

        var body_lang = this.$selectors.body.attr(CONST.ATTRIBUTE.LANG);

        if (!body_lang)
            body_lang = (!(options || {}).lang) ? this.settings.lang : options.lang;

        if (!/^\w{2}\-\w{2}/.test(body_lang))
            body_lang = body_lang + CONST.CHAR.DASH + body_lang.toUpperCase();

        _.lang_use = (typeof (options || {}).lang !== CONST.DATA_TYPE.UNDEFINED && (options || {}).lang !== this.defaults.lang) ? this.settings.lang : (body_lang || window.navigator.language);

        this.localization = window.Localization[pluginName][_.lang_use] || window.Localization[pluginName][this.defaults.lang];

        this.offset = 0;
        this.initial_tabs_width = 0;
        this.initial_contents_width = 0;

        function __construct() {
            _getElements();
            _buildHTML();
            obj.update();
            _startEventListeners();
            return obj;
        }

        function _getElements() {
            obj.$selectors.tabs_container = obj.$selectors.root.children(obj.settings.selectors.tabs_container);
            obj.$selectors.tabs = obj.$selectors.tabs_container.children(obj.settings.selectors.tabs);
            obj.$selectors.contents_container = obj.$selectors.root.children(obj.settings.selectors.contents_container);
            obj.$selectors.contents = obj.$selectors.contents_container.children(obj.settings.selectors.content);
            
            obj.initial_tabs_width = obj.$selectors.tabs_container.outerWidth(true);
            obj.initial_contents_width = obj.$selectors.contents_container.outerWidth(true);
        }

        function _buildHTML() {
            if (obj.settings.vertical || obj.$selectors.root.hasClass(obj.settings.classes.vertical)) {
                obj.settings.vertical = true;
                obj.$selectors.root.addClass(obj.settings.classes.vertical);
            }
            
            obj.$selectors.tabs_wrapper = $(obj.settings.templates.tabs_wrapper).appendTo(obj.$selectors.tabs_container);

            obj.$selectors.tabs.appendTo(obj.$selectors.tabs_wrapper);

            if (obj.settings.responsive_scroller && !obj.settings.vertical) {
                var tabs_width = 0;
                obj.$selectors.tabs.each(function () {
                    tabs_width += $(this).outerWidth(true);
                });

                obj.$selectors.tabs_wrapper.width(tabs_width + 1);

                obj.$selectors.tabs_container.height(obj.$selectors.tabs.outerHeight(true));
            } else {

            }
        }

        function _appendControls() {
            if (!obj.$selectors.tabs_controls) {
                obj.$selectors.tabs_wrapper.css({
                    transform: 'translateX(' + obj.offset + 'px)'
                });
                obj.$selectors.tabs_controls = $(obj.settings.templates.tabs_contols).appendTo(obj.$selectors.tabs_container);

                var controls = {};

                if (obj.settings.reverse_scroll) {
                    controls = {
                        scroll_left: obj.settings.actions.scroll_right,
                        scroll_right: obj.settings.actions.scroll_left
                    };
                } else {
                    controls = {
                        scroll_left: obj.settings.actions.scroll_left,
                        scroll_right: obj.settings.actions.scroll_right
                    };
                }

                var template = {
                    left: obj.renderTemplate(obj.settings.templates.controls.left, controls),
                    right: obj.renderTemplate(obj.settings.templates.controls.right, controls)
                };

                obj.$selectors.scroll_left = $(template.left).appendTo(obj.$selectors.tabs_controls);
                obj.$selectors.scroll_right = $(template.right).appendTo(obj.$selectors.tabs_controls);

                if (obj.offset === 0)
                    obj.$selectors.scroll_left.addClass(obj.settings.classes.disabled);

                obj.$selectors.tabs_controls.on(CONST.EVENT.CLICK, CONST.ELEMENTS.ALL, function () {
                    var $this = $(this);
                    switch ($this.data('role')) {
                        case 'scroll-left':
                            obj.scrollLeft();
                            break;

                        case 'scroll-right':
                            obj.scrollRight();
                            break;

                        default:
                            break;
                    }
                });
            }
        }

        function _removeControls() {
            if (obj.$selectors.tabs_controls) {
                obj.$selectors.tabs_controls.empty().remove();
                delete obj.$selectors.tabs_controls;
                obj.offset = 0;
                
                obj.$selectors.tabs_container.removeClass(obj.settings.classes.fade_front);
                obj.$selectors.tabs_wrapper.css({
                    transform: 'translateX(' + obj.offset + 'px)'
                });
            }
        }

        this.scrollLeft = function () {
            if (obj.offset < -100)
                obj.offset += 100;
            else
                obj.offset = 0;

            if (obj.offset < 0) {
                obj.$selectors.tabs_container.addClass(obj.settings.classes.fade_front);
                if (obj.settings.reverse_scroll) {
                    obj.$selectors.scroll_right.removeClass(obj.settings.classes.disabled);
                } else {
                    obj.$selectors.scroll_left.removeClass(obj.settings.classes.disabled);
                }
            } else {
                obj.$selectors.tabs_container.removeClass(obj.settings.classes.fade_front);
                if (obj.settings.reverse_scroll) {
                    obj.$selectors.scroll_right.addClass(obj.settings.classes.disabled);
                } else {
                    obj.$selectors.scroll_left.addClass(obj.settings.classes.disabled);
                }
            }

            obj.$selectors.tabs_wrapper.css({
                transform: 'translateX(' + obj.offset + 'px)'
            });
            _.wrapper_visible_width = obj.$selectors.tabs_wrapper.outerWidth(true) + obj.offset;
            _.container_visible_width = obj.$selectors.tabs_container.outerWidth() - obj.$selectors.tabs_controls.outerWidth(true);

            if (_.wrapper_visible_width > _.container_visible_width)
                obj.$selectors.scroll_right.removeClass(obj.settings.classes.disabled);
        };
        
        function _appendMenu(){
            if (!obj.$selectors.menu) {
                console.log(obj.$selectors.root.attr('id'), 'add menu');
                obj.$selectors.root.addClass(obj.settings.classes.menu);
                obj.$selectors.menu = $(obj.settings.templates.menu).prependTo(obj.$selectors.tabs_container);
                
                var current_tab_text = obj.$selectors.tabs.filter(CONST.SELECTOR.CLASS + obj.settings.classes.current).text();
                
                obj.$selectors.menu_current_tab = $(obj.renderTemplate(obj.settings.templates.menu_current_tab, {
                    title: current_tab_text
                })).insertAfter(obj.$selectors.menu);
                obj.$selectors.menu.on(CONST.EVENT.CLICK, function(){
                    obj.$selectors.tabs_container.toggleClass(obj.settings.classes.opened);
                });
            }
        }
        
        function _removeMenu(){
            if (obj.$selectors.root.hasClass(obj.settings.classes.menu)) {
                console.log(obj.$selectors.root.attr('id'), 'remove menu');
                obj.$selectors.tabs_container.removeClass(obj.settings.classes.opened);
                obj.$selectors.root.removeClass(obj.settings.classes.menu);
                if (obj.$selectors.menu) {
                    obj.$selectors.menu.remove();
                    obj.$selectors.menu_current_tab.remove();
                    delete obj.$selectors.menu;
                    delete obj.$selectors.menu_current_tab;
                }
            }
        }

        this.scrollRight = function () {
            if (!obj.$selectors.scroll_right.hasClass(obj.settings.classes.disabled)) {
                _.wrapper_visible_width = obj.$selectors.tabs_wrapper.outerWidth(true) + obj.offset;
                _.container_visible_width = obj.$selectors.tabs_container.outerWidth() - obj.$selectors.tabs_controls.outerWidth(true);
                if (_.wrapper_visible_width > _.container_visible_width) {
                    obj.offset -= 100;

                    obj.$selectors.tabs_container.addClass(obj.settings.classes.fade_front);
                    obj.$selectors.scroll_left.removeClass(obj.settings.classes.disabled);


                    obj.$selectors.tabs_wrapper.css({
                        transform: 'translateX(' + obj.offset + 'px)'
                    });

                    _.wrapper_visible_width = obj.$selectors.tabs_wrapper.outerWidth(true) + obj.offset;
                    _.container_visible_width = obj.$selectors.tabs_container.outerWidth() - obj.$selectors.tabs_controls.outerWidth(true);

                    if (_.wrapper_visible_width <= _.container_visible_width)
                        obj.$selectors.scroll_right.addClass(obj.settings.classes.disabled);
                } else {
                    obj.$selectors.scroll_right.addClass(obj.settings.classes.disabled);
                }
            }
        };

        this.update = function () {
            if (!obj.settings.vertical) {
                if (obj.$selectors.tabs_wrapper.outerWidth(true) > obj.$selectors.tabs_container.outerWidth(true)) {
                    _appendControls();
                } else {
                    _removeControls();
                }
            } else {
                if (obj.initial_tabs_width * 2 > obj.$selectors.contents_container.outerWidth()) {
                    _appendMenu();
                } else {
                    _removeMenu();
                }
            }
        };

        this.changeTab = function ($element) {
            if (typeof $element === CONST.DATA_TYPE.STRING) {
                if ($element.charAt(0) === CONST.CHAR.HASH) {
                    $element = obj.$selectors.tabs.filter('[href="' + $element + '"]');
                } else {
                    if (window.console && console.error) {
                        console.error(obj.localization.error.provide_valid_selector);
                    }
                }
            }

            obj.$selectors.tabs.removeClass(obj.settings.classes.current);
            $element.addClass(obj.settings.classes.current);

            obj.$selectors.contents.removeClass(obj.settings.classes.current);
            obj.$selectors.contents.filter($element.attr(CONST.ATTRIBUTE.HREF)).addClass(obj.settings.classes.current);
            
            if (obj.$selectors.menu) {
                if (obj.settings.menu_close_on_click)
                    obj.$selectors.tabs_container.removeClass(obj.settings.classes.opened);
                
                obj.$selectors.menu_current_tab.text(obj.$selectors.tabs.filter(CONST.SELECTOR.CLASS + obj.settings.classes.current).text());
            }
        };

        function _startEventListeners() {
            obj.$selectors.tabs.on(CONST.EVENT.CLICK, function (e) {
                e.preventDefault();

                if (this.href.isUrl() && !obj.settings.tab_content_ajax) {
                    window.location.assign(this.href);
                    return false;
                }

                var $this = $(this);

                obj.changeTab($this);

                if (typeof obj.settings.onTabClick === CONST.DATA_TYPE.FUNCTION)
                    obj.settings.onTabClick.apply(obj, [e, $this]);
            });

            obj.$selectors.window.on(CONST.EVENT.RESIZE, function () {
                obj.update();
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
                    return text.replace(CONST.REGEXP.EVERY_TRANSLATABLE_TEXT, function ($0, $1) {
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