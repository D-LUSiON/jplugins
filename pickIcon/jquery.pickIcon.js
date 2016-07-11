/**
 * TITLE: Font Icon picker
 * AUTHOR: D-LUSiON
 * VERSION: v1.0.1
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 */

/**
 * CHANGELOG
 * 
 * 1.0.1
 *  - Fixed CDN loading - if proper header is present, there is no problem;
 *  - Added "allowed fonts" - you can specify witch fonts to be shown in dropdown menu;
 *  - Larger style for choosen icon;
 * 
 * 1.0.0 - Initial build
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
    var pluginName = 'pickIcon',
        version = 'v1.0.0',
        dependancies = [],
        NS = {},
        CONST = {
            LANG: {
                EN: 'en-US',
                BG: 'bg-BG'
            },
            SELECTOR: {
                HEAD: 'head',
                BODY: 'body',
                ID: '#',
                CLASS: '.',
                LAST_ELEMENT: ':last',
                LAST_OF_TYPE: ':last-of-type',
                HIDDEN: ':hidden'
            },
            ELEMENT: {
                DIV: '<div/>',
                SELECT: '<select/>',
                OPTION: '<option/>'
            },
            CHAR: {
                DASH: '-',
                SPACE: ' '
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
                CHANGE: 'change',
                LOAD: 'load'
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

    if (!window.Localization[pluginName])
        window.Localization[pluginName] = {
            'en-US': {
                error: {
                    css_from_cdn: 'You\'re using stylesheet from CDN. If the server does not send "Access-Control-Allow-Origin: *" header, they can\'t be loaded. Please, include it from local folder!'
                },
                iconset_choose: 'Please, select font...',
                filter: 'Filter...',
                remove_icon: 'Remove icon'
            },
            'bg-BG': {
                error: {
                    css_from_cdn: 'Използвате стилове, заредени от CDN. Ако сървъра не изпраща "Access-Control-Allow-Origin: *" хедър, те не могат да бъдат заредени. Моля, заредете ги от локална папка!'
                },
                iconset_choose: 'Изберете шрифт...',
                filter: 'Филтриране...',
                remove_icon: 'Премахване на иконата'
            }
        };

    NS[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            lang: 'en-US',
            clickable: true,
            filterable: true,
            show_icon_title: false,
            cdn: {
                fontawesome: {
                    title: 'FontAwesome',
                    selector: 'fa',
                    icon_selector: 'fa-',
                    url: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css'
                },
                ionicons: {
                    title: 'Ionic Icons',
                    selector: '',
                    icon_selector: 'ion-',
                    url: 'http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css'
                },
                foundation_icons: {
                    title: 'Foundation Icons 3',
                    selector: '',
                    icon_selector: 'fi-',
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.min.css'
                },
                themify: {
                    title: 'Themify icons',
                    selector: '',
                    icon_selector: 'ti-',
                    url: 'dist/themify/themify-icons.css'
                }
            },
            classes: {
                disabled: 'pickIcon-disabled',
                clickable: 'clickable',
                icon_in_list: 'pickIcon-icon',
                no_icon: 'none'
            },
            templates: {
                wrap: '<div class="pickIcon-container"/>',
                selected_icon_wrap: '<div class="pickIcon-selected"/>',
                selected_icon: '<span class="pickIcon-icon"/>',
                selected_icon_title: '<span class="pickIcon-title"/>',
                dropdown_container: '<div class="pickIcon-dropdown"/>',
                filter: '<input type="text" class="pickIcon-filter" placeholder="|%filter%|"/>',
                icons_list: '<div class="pickIcon-dropdown_list"/>',
                icon: '<span class="[[sys_class]] [[selector]] [[icon_selector]][[icon]]" title="[[title]]" data-selector="[[selector]]" data-icon_selector="[[icon_selector]]" data-alias="[[alias]]"/>',
                icon_none: '<span class="[[sys_class]] none" title="|%remove_icon%|"/>',
                link: '<link rel="stylesheet" type="text/css" href="[[link]]" media="all" crossorigin="anonymous">'
            }
        };

        this.$selectors = {
            head: $(CONST.SELECTOR.HEAD),
            body: $(CONST.SELECTOR.BODY),
            root: $(element)
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});

        var body_lang = this.$selectors.body.attr(CONST.ATTRIBUTE.LANG) || this.settings.lang;
        
        if (!/^\w{2}\-\w{2}/.test(body_lang))
            body_lang = body_lang + CONST.CHAR.DASH + body_lang.toUpperCase();
        
        var lang_use = (typeof (options || {}).lang !== CONST.DATA_TYPE.UNDEFINED && (options || {}).lang !== this.defaults.lang)? this.settings.lang : (body_lang || window.navigator.language );
        
        this.localization = window.Localization[pluginName][lang_use] || window.Localization[pluginName][this.defaults.lang];
        
        this.iconset = null;
        this.current_icons = [];
        this.allowed_sets = [];
        
        var _ = {};

        function __construct() {
            if (obj.$selectors.root.data().allowed_sets)
                obj.allowed_sets = obj.$selectors.root.data().allowed_sets.split(',');
            
            obj.updateCdnIcons();
            _buildHtml();
            _startEventListeners();
            return obj;
        }
        
        function _buildHtml(){
            obj.$selectors.root.wrap(obj.settings.templates.wrap);
            obj.$selectors.wrap = obj.$selectors.root.parent();
            
            if (obj.settings.clickable)
                obj.$selectors.wrap.addClass(obj.settings.classes.clickable);
            
            obj.$selectors.selected_icon_container = $(obj.settings.templates.selected_icon_wrap).appendTo(obj.$selectors.wrap);
            obj.$selectors.selected_icon = $(obj.settings.templates.selected_icon).appendTo(obj.$selectors.selected_icon_container);
            
            if (obj.$selectors.root.val() === CONST.EMPTY_STRING) {
                obj.$selectors.selected_icon.addClass(obj.settings.classes.no_icon);
            } else {
                obj.$selectors.selected_icon.addClass(obj.$selectors.root.val());
            }
            
            if (obj.settings.show_icon_title)
                obj.$selectors.selected_icon_title = $(obj.settings.templates.selected_icon_title).appendTo(obj.$selectors.selected_icon_container);
            
            obj.$selectors.dropdown_container = $(obj.settings.templates.dropdown_container).appendTo(obj.$selectors.wrap);
            
            // iconsets dropdown
            obj.$selectors.iconset_select = $(CONST.ELEMENT.SELECT).appendTo(obj.$selectors.dropdown_container);
            $(CONST.ELEMENT.OPTION).val(CONST.EMPTY_STRING).attr({
                'selected': true,
                'disabled': true
            }).text(obj.localization.iconset_choose).appendTo(obj.$selectors.iconset_select);
            
            for (var font in obj.settings.cdn) {
                if (obj.allowed_sets.length === 0 || ( obj.allowed_sets.length > 0 && obj.allowed_sets.indexOf(font) > -1))
                    $(CONST.ELEMENT.OPTION).val(font).text(obj.settings.cdn[font].title).appendTo(obj.$selectors.iconset_select);
            }
            
            //icons filter
            if (obj.settings.filterable) {
                obj.$selectors.filter = $(obj.translate(obj.settings.templates.filter)).hide().appendTo(obj.$selectors.dropdown_container);
            }
            
            // icons list
            obj.$selectors.icons_list = $(obj.settings.templates.icons_list).appendTo(obj.$selectors.dropdown_container);
        }
        
        this.updateCdnIcons = function(){
            for (var font in this.settings.cdn) {
                if (obj.allowed_sets.length === 0 || ( obj.allowed_sets.length > 0 && obj.allowed_sets.indexOf(font) > -1))
                    if (this.$selectors.head.find('[href="' + this.settings.cdn[font].url + '"]').length === 0) {
                        $(obj.renderTemplate(this.settings.templates.link, {
                            link: this.settings.cdn[font].url
                        })).insertAfter(this.$selectors.head.find('link' + CONST.SELECTOR.LAST_OF_TYPE));
                    }
            }
        };
        
        function _setFontIcons(font){
            obj.current_icons = obj.getSelectorsForFont(font);
            
            // add "remove icon" icon
            var html = obj.renderTemplate(obj.settings.templates.icon_none, {
                            sys_class: obj.settings.classes.icon_in_list
                        });
            
            // add the rest of the icons
            for (var i = 0, max = obj.current_icons.length; i < max; i++) {
                for (var j = 0, max1 = obj.current_icons[i].alias.length; j < max1; j++) {
                    var icon = obj.current_icons[i].alias[j].replace(obj.iconset.icon_selector, CONST.EMPTY_STRING);
                    
                    // add icon if is the first alias
                    if ((obj.iconset.icon_selector + icon) === obj.current_icons[i].alias[0])
                        html += obj.renderTemplate(obj.settings.templates.icon, {
                                    sys_class: obj.settings.classes.icon_in_list,
                                    selector: obj.iconset.selector,
                                    icon_selector: obj.iconset.icon_selector,
                                    icon: icon,
                                    title: icon,
                                    alias: obj.current_icons[i].alias.join(CONST.CHAR.SPACE)
                                });
                }
            }
            
            $(html).appendTo(obj.$selectors.icons_list.empty());
        }
        
        function _setChoosenIcon(icon){
            obj.$selectors.selected_icon
                    .attr(CONST.ATTRIBUTE.CLASS, CONST.EMPTY_STRING);
            
            if (icon.selector)
                obj.$selectors.selected_icon
                    .addClass(icon.selector);
            
            
            if (icon.icon_selector)
                obj.$selectors.selected_icon
                    .addClass(icon.icon_selector + icon.title);
            
            if (obj.$selectors.selected_icon_title)
                obj.$selectors.selected_icon_title
                    .text(icon.title);
            
            var value = obj.$selectors.selected_icon.attr(CONST.ATTRIBUTE.CLASS);
            
            obj.$selectors.selected_icon
                    .addClass($(obj.settings.templates.selected_icon).attr(CONST.ATTRIBUTE.CLASS));
            
            if (value === CONST.EMPTY_STRING)
                obj.$selectors.selected_icon
                    .addClass(obj.settings.classes.no_icon);
            
            obj.$selectors.root.val(value);
            
            if (obj.settings.clickable)
                obj.$selectors.dropdown_container.slideUp();
        }
        
        this.getSelectorsForFont = function(font){
            var stylesheet, cssRules;
            for (var i = 0, max = document.styleSheets.length; i < max; i++)
                if (document.styleSheets[i].href.indexOf(this.settings.cdn[font].url) > -1)
                    stylesheet = document.styleSheets[i];
            
            if (stylesheet.rules === null) {
                if (window.console && console.error)
                    console.error(obj.localization.error.css_from_cdn);
                return false;
            }
            
            var icons = [];
            
            cssRules = stylesheet.rules || stylesheet.cssRules;
            
            for (var i = 0, max = cssRules.length; i < max; i++) {
                if (/^\.(.+?)::before/.test(cssRules[i].selectorText)) {
                    var is_icon = false;
                    
                    for (var j = 0, max1 = cssRules[i].style.length; j < max1; j++) {
                        if (cssRules[i].style[j] === 'content') {
                            is_icon = true;
                        }
                    }
                    
                    if (is_icon) {
                        var selector = cssRules[i].selectorText.split(/,\s{0,}/gi).map(function(val){
                            return val.replace(/^\./, CONST.EMPTY_STRING).replace(/:{1,2}(.+?)$/, CONST.EMPTY_STRING);
                        });
                        
                        icons.push({
                            icon: selector[0],
                            alias: selector
                        });
                    }
                }
            }
                
            return icons;
        };

        function _startEventListeners() {
            if (obj.settings.clickable && !obj.$selectors.wrap.hasClass(obj.settings.classes.disabled))
                obj.$selectors.selected_icon_container.on(CONST.EVENT.CLICK, function(){
                    obj.$selectors.dropdown_container.slideToggle();
                });
            
            obj.$selectors.iconset_select.on(CONST.EVENT.CHANGE, function(){
                obj.iconset = obj.settings.cdn[this.value];
                obj.iconset.sys_name = this.value;
                
                if (obj.settings.filterable) {
                    if (this.value === CONST.EMPTY_STRING) {
                        obj.$selectors.filter.hide();
                    } else {
                        obj.$selectors.filter.val(CONST.EMPTY_STRING).show();
                    }
                }
                    
                _setFontIcons(this.value);
            });
            
            obj.$selectors.dropdown_container.on(CONST.EVENT.CLICK, CONST.SELECTOR.CLASS + obj.settings.classes.icon_in_list, function(){
                var icon_data = $(this).data();
                icon_data.title = this.title;
                
                _setChoosenIcon(icon_data);
            });
            
            if (obj.settings.filterable)
                obj.$selectors.filter.on(CONST.EVENT.KEYUP, function(){
                    var $icons = obj.$selectors.icons_list.children();
                    
                    if (this.value === CONST.EMPTY_STRING) {
                        $icons.show();
                    } else {
                        $icons.hide();
                        $icons.filter('[data-alias*="' + this.value + '"]').show();
                    }
                });
            
            obj.$selectors.body.on(CONST.EVENT.CLICK, function(e){
                var $this = $(e.target);
                
                if ($this.closest(obj.$selectors.wrap).length === 0)
                    obj.$selectors.dropdown_container.slideUp();
            });
        }

        this.enable = function () {
            obj.$selectors.wrap.removeClass(obj.settings.classes.disabled);
            return this;
        };

        this.disable = function () {
            obj.$selectors.wrap.addClass(obj.settings.classes.disabled);
            obj.$selectors.dropdown_container.slideUp();
            return this;
        };

        this.destroy = function () {
            this.$selectors.root.removeData(pluginName);
            this.$selectors.root.insertBefore(this.$selectors.wrap);
            this.$selectors.wrap.empty().remove();
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
                        if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] === CONST.FUNCTION)
                            result = data[options].apply(data, Array.prototype.slice.call(args, 1));
                        else if (typeof options === CONST.DATA_TYPE.STRING && typeof data[options] !== CONST.FUNCTION) {
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