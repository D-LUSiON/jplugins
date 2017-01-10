/**
 * TITLE: jQuery Extended Autocomplete v2
 * AUTHOR: D-LUSiON
 * VERSION: v2.1.0
 * COPYRIGHT:
 *      (2015 - 2016) D-LUSiON;
 *      Licensed under the MIT license: http://www.opensource.org/licenses/MIT
 */

/**
 * CHANGELOG
 * 
 * v2.1.0
 * - Added support for templating the input when not focused
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
    var pluginName = 'ExtAC2',
        version = 'v2.1.0',
        dependancies = [],
        NS = {},
        CONST = {
            LANG: {
                EN: 'en-US',
                BG: 'bg-BG'
            },
            SELECTOR: {
                HTML: 'html',
                BODY: 'body',
                CLASS: '.',
                input: 'input',
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
                COMMA: 188,
                ARROW_LEFT: 37,
                ARROW_UP: 38,
                ARROW_RIGHT: 39,
                ARROW_DOWN: 40
            },
            EVENT: {
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

    window.Localization[pluginName] = {
        'en-US': {},
        'bg-BG': {
            'Enter value...': 'Въведете стойност...'
        }
    };
    
    NS.DataSource = function(options){
        var self = this,
            _emmiter = $('<div/>');
        
        this.auto_bind = true;
        this.model = {
            id_field: 'id',
            parent_id_field: 'parent_id',
            text_field: 'title'
        };
        this.data = [];
        this.hierarchy_data = {};
        this.paths = {};
        
        function __construct(){
            self.set(options);
            if ((!self.data || self.data.length === 0) && self.auto_bind) {
                setTimeout(function(){
                    self.read();
                }, 10);
            }
        };
        
        function _sortHierarchyArray(arr){
            var sorted_data = [];
            
            loop1:
                for (var i = 0, max = arr.length; i < max; i++) {
                    
                    // look for root element
                    var idx = sorted_data.map(function(x){
                        return x[self.model.id_field];
                    }).indexOf(arr[i][self.model.parent_id_field]);

                    if (idx === -1) {
                        // insert root element
                        sorted_data.push(arr[i]);
                    } else {
                        // insert child element
                        var offset = 1;
                        
                        loop2:
                            while (idx + offset < sorted_data.length){
                                if (
                                        !sorted_data[idx + offset][self.model.parent_id_field] || // indexed element is root
                                        (
                                            sorted_data[idx + offset][self.model.parent_id_field] === arr[i][self.model.parent_id_field] && // both have same parent
                                            sorted_data[idx + offset][self.model.id_field] > arr[i][self.model.id_field] // indexed element is in fact after inserted element
                                        )
                                    )
                                    break loop2; // the offset is found and we're breaking the while loop
                                
                                offset++; // offset is not found and we're increasing it
                            };
                            
                        sorted_data.splice(idx + offset, 0, arr[i]);
                    }
                };
            
            return sorted_data;
        }
        
        function _setSublevel(arr){
            var sublvl = 0,
                path = [];
            
            function _getParrent(elem) {
                sublvl++;
                var parrent_idx = arr.map(function(x){
                    return x[self.model.id_field];
                }).indexOf(elem[self.model.parent_id_field]);
                
                path.push(arr[parrent_idx][self.model.text_field]);
                
                if (arr[parrent_idx][self.model.parent_id_field])
                    _getParrent(arr[parrent_idx]);
                else
                    return sublvl;
            }
            
            for (var i = 0, max = arr.length; i < max; i++) {
                sublvl = 0;
                path = [];
                
                if (arr[i][self.model.parent_id_field])
                    _getParrent(arr[i]);
                
                arr[i]._sublevel = sublvl;
                arr[i]._path = path.reverse();
            }
        }
        
        // sets options
        this.set = function(opt){
            
            this.auto_bind = opt.auto_bind;
            
            if (opt.model)
                this.model = opt.model;
            
            if (opt.data)
                this.data = opt.data;
            
            for (var key in opt)
                if (['model', 'data', 'auto_bind'].indexOf(key) === -1)
                    this.paths[key] = opt[key];
        };
        
        this.getBy = function(prop, val){
            return this.data.filter(function(el){
                return el[prop] == val; // value might be string, but in the data value is number
            })[0];
        };
        
        this.add = function(){};
        
        this.read = function(){
            if ((this.paths.read || {}).url || typeof (this.paths.read || {}).url === CONST.DATA_TYPE.STRING) {
                $.ajax({
                    url: this.paths.read.url,
                    data: this.paths.read.url,
                    method: this.paths.read.method,
                    dataType: this.paths.read.dataType || CONST.EMPTY_STRING,
                    beforeSend: function(){
                        _emmiter.trigger('loadingData');
                    },
                    success: function(response){
                        self.data = response;
                        
                        self.data = _sortHierarchyArray(self.data);
                        
                        _setSublevel(self.data);
                        _emmiter.trigger('dataLoaded', [self.data]);
                    }
                });
            }
        };
        
        this.update = function(){};
        
        this.remove = function(){};
        
        this.on = function(event, callback){
            _emmiter
                .off(event)
                .on(event, function(e, data){
                    if (typeof callback === CONST.DATA_TYPE.FUNCTION)
                        callback.apply(self, [e, data]);
                });
            return this;
        };
        
        __construct();
        return self;
    };

    NS[pluginName] = function (element, options) {
        var obj = this;
        this.defaults = {
            lang: 'en-US',
            transport: {
                auto_bind: true,
                model: {},
                data: [],
                create: {
                    url: '',
                    data: {},
                    method: 'POST',
                    dataType: 'json'
                },
                read: {
                    url: '',
                    data: {},
                    method: 'POST',
                    dataType: 'json'
                },
                update: {
                    url: '',
                    data: {},
                    method: 'POST',
                    dataType: 'json'
                },
                destroy: {
                    url: '',
                    data: {},
                    method: 'POST',
                    dataType: 'json'
                }
            },
            classes: {
                cls_prefix: 'ExtAC-',
                wrapper: 'wrapper',
                input_container: 'input_container',
                dropdown: 'dropdown',
                result: 'result',
                loading: 'loading',
                open: 'opened',
                highlight: 'highlight',
                highlight_text: 'highlight_text'
            },
            templates: {
//                input: '<input type="text" placeholder="|%Enter value...%|"/>',
                input: '<div class="ExtAC-input" placeholder="|%Enter value...%|" contenteditable="true"/>',
                result: '<div class="ExtAC-result sublevel-[[_sublevel]] ExtAC-[[type]]" data-id="[[id]]" data-parent_id="[[parent_id]]">[[title]]</div>',
                no_result: '<div class="ExtAC-no_result">|%No results found for <strong>"[[value]]"</strong>...%|</div>',
                no_data: '<div class="ExtAC-no_data">|%No data provided...%|</div>',
                value_path: '<span class="ExtAC-path">[[path]]</span>[[title]]'
            },
            placeholder: '',
            value_format: '[[id]]',
            show_value_path: true,
            path_divider: ' _> '
        };

        this.settings = $.extend(true, {}, this.defaults, options || {});
        
        this.$selectors = {
            html: $(CONST.SELECTOR.HTML),
            body: $(CONST.SELECTOR.BODY),
            root: $(element),
            wrapper: $(CONST.ELEMENTS.DIV),
            input_container: $(CONST.ELEMENTS.DIV),
            input: undefined,
            dropdown: $(CONST.ELEMENTS.DIV),
            results: undefined,
            no_results: undefined
        };
        
        var body_lang = this.$selectors.body.attr(CONST.ATTRIBUTE.LANG) || this.defaults.lang;
        
        if (!/^\w{2}\-\w{2}/.test(body_lang))
            body_lang = body_lang + CONST.CHAR.DASH + body_lang.toUpperCase();
        
        var lang_use = (typeof (options || {}).lang !== CONST.DATA_TYPE.UNDEFINED && (options || {}).lang !== this.defaults.lang)? this.settings.lang : (body_lang || window.navigator.language );
        
        this.localization = window.Localization[pluginName][lang_use] || window.Localization[pluginName][this.defaults.lang];
        
        this.dataSource = undefined;
        
        this.selected_value = {};

        function __construct() {
            _buildHtml();
            _initDataSource();
            _startEventListeners();
            return obj;
        }
        
        function _buildHtml(){
            obj.$selectors.wrapper
                    .attr(CONST.ATTRIBUTE.CLASS, obj.settings.classes.cls_prefix + obj.settings.classes.wrapper)
                    .insertBefore(obj.$selectors.root);
            
            obj.$selectors.root
                    .hide()
                    .appendTo(obj.$selectors.wrapper);
            
            obj.$selectors.input_container
                    .attr(CONST.ATTRIBUTE.CLASS, obj.settings.classes.cls_prefix + obj.settings.classes.input_container)
                    .prependTo(obj.$selectors.wrapper);
            
            obj.$selectors.input = $(obj.translate(obj.settings.templates.input))
                                        .appendTo(obj.$selectors.input_container);
            
            obj.$selectors.dropdown
                    .attr(CONST.ATTRIBUTE.CLASS, obj.settings.classes.cls_prefix + obj.settings.classes.dropdown)
                    .insertAfter(obj.$selectors.input_container);
            
            obj.$selectors.no_data = $(obj.renderTemplate(obj.settings.templates.no_data, {})).hide().appendTo(obj.$selectors.dropdown);
        }
        
        function _buildResultsHtml(){
            if (obj.dataSource.data.length > 0) {
                var html = CONST.EMPTY_STRING;
                
                for (var i = 0, max = obj.dataSource.data.length; i < max; i++)
                    html += obj.renderTemplate(obj.settings.templates.result, obj.dataSource.data[i]);

                obj.$selectors.dropdown.html(html);

                obj.$selectors.results = obj.$selectors.dropdown.children();

                obj.$selectors.no_results = $(obj.renderTemplate(obj.settings.templates.no_result, {})).hide().appendTo(obj.$selectors.dropdown);
                
                if (obj.$selectors.root.val() === CONST.EMPTY_STRING)
                    obj.$selectors.results.removeClass(obj.settings.classes.cls_prefix + obj.settings.classes.highlight);
                else {
                    var $highlighted = obj.$selectors.results
                                                        .filter('[data-' + obj.dataSource.model.id_field + '="' + obj.$selectors.root.val() + '"]')
                                                        .addClass(obj.settings.classes.cls_prefix + obj.settings.classes.highlight),
                        highlighted_data = $highlighted.data();
                    
                    highlighted_data = obj.dataSource.getBy(obj.dataSource.model.id_field, highlighted_data[obj.dataSource.model.id_field]);
                    
                    _setTypingInputValue(highlighted_data);
                    
                }
            } else {
                obj.$selectors.no_data = $(obj.renderTemplate(obj.settings.templates.no_data, {})).appendTo(obj.$selectors.dropdown);
            }
        }
        
        function _initDataSource(){
            obj.dataSource = new NS.DataSource(obj.settings.transport);
        }
        
        this.openDropdown = function(){
            if (obj.$selectors.input.get(0).nodeName === CONST.SELECTOR.INPUT)
                obj.$selectors.input.val(obj.selected_value[obj.dataSource.model.text_field]);
            else
                obj.$selectors.input.text(obj.selected_value[obj.dataSource.model.text_field]);
            
            obj.$selectors.wrapper.addClass(obj.settings.classes.cls_prefix + obj.settings.classes.open);
        };
        
        this.closeDropdown = function(){
            obj.$selectors.wrapper.removeClass(obj.settings.classes.cls_prefix + obj.settings.classes.open);
            
            if (obj.$selectors.input.get(0).nodeName === CONST.SELECTOR.INPUT)
                obj.$selectors.input.val(obj.selected_value[obj.dataSource.model.text_field]);
            else {
                if (obj.settings.show_value_path) {
                    var path = obj.selected_value._path? obj.selected_value._path.join(obj.settings.path_divider) : CONST.EMPTY_STRING;

                    path = (path !== CONST.EMPTY_STRING)? path + obj.settings.path_divider : CONST.EMPTY_STRING;

                    var selected_value = $.extend(true, {}, obj.selected_value, { path: path }),
                        input_text = obj.settings.show_value_path? obj.renderTemplate(obj.settings.templates.value_path, selected_value) : obj.selected_value[obj.dataSource.model.text_field];

                    obj.$selectors.input.html(input_text);
                } else {
                    obj.$selectors.input.text(obj.selected_value[obj.dataSource.model.text_field]);
                }
            }
            
            obj.$selectors.input.trigger(CONST.EVENT.BLUR);
        };
        
        this.highlight = function(index){
            var $highlighted = obj.$selectors.results.filter(':eq(' + index + ')'),
                highlighted_data = $highlighted.data();
        
            highlighted_data = obj.dataSource.getBy(obj.dataSource.model.id_field, highlighted_data[obj.dataSource.model.id_field]);
            
            obj.$selectors.results.removeClass(obj.settings.classes.cls_prefix + obj.settings.classes.highlight);
            $highlighted
                    .addClass(obj.settings.classes.cls_prefix + obj.settings.classes.highlight)
                    .trigger(obj.settings.classes.cls_prefix + CONST.EVENT.FOCUS, [index]);
            
            _setTypingInputValue(highlighted_data);
        };
        
        function __addParent(result, stack){
            var parent_idx = obj.dataSource.data.map(function(x){
                return x[obj.dataSource.model.id_field];
            }).indexOf(result[obj.dataSource.model.parent_id_field]);

            if (stack.indexOf(obj.dataSource.data[parent_idx][obj.dataSource.model.id_field]) === -1)
                stack.push(obj.dataSource.data[parent_idx][obj.dataSource.model.id_field]);

            if (obj.dataSource.data[parent_idx][obj.dataSource.model.parent_id_field])
                __addParent(obj.dataSource.data[parent_idx], stack);
        }
        
        this.filter = function(string){
            if (string === CONST.EMPTY_STRING) {
                obj.$selectors.results.each(function(){
                    var $result = $(this);
                    $result.show().html($result.text());
                });
            } else {
                
                var found = [];
                
                for (var i = 0, max = obj.dataSource.data.length; i < max; i++) {
                    if (obj.dataSource.data[i][obj.dataSource.model.text_field].toLowerCase().indexOf(string.toLowerCase()) > -1) {
                        found.push(obj.dataSource.data[i][obj.dataSource.model.id_field]);
                    
                        if (obj.dataSource.data[i][obj.dataSource.model.parent_id_field])
                            __addParent(obj.dataSource.data[i], found);
                    }
                }
                
                if (found.length === 0) {
                    var innerHtml = $(obj.renderTemplate(obj.settings.templates.no_result, { value: string })).get(0).innerHTML;
                    obj.$selectors.no_results.show().html(innerHtml);
                } else
                    obj.$selectors.no_results.hide();
                
                obj.$selectors.results.each(function(){
                    var $result = $(this);
                    if (found.indexOf($result.data()[obj.dataSource.model.id_field]) > -1) {
                        var new_text = $result.text().replace(new RegExp(string, CONST.REGEXP.GLOBAL_IGNORE_CASE), function(f){
                            return '<span class="' + obj.settings.classes.cls_prefix + obj.settings.classes.highlight_text + '">' + f + '</span>';
                        });
                        $result.show().html(new_text);
                    } else
                        $result.hide().html($result.text());
                });
            }
        };
        
        this.setValue = function(data){
            obj.selected_value = data;
            obj.$selectors.root.val(obj.renderTemplate(obj.settings.value_format, data));
        };
        
        function _setTypingInputValue(data){
            if (obj.$selectors.input.get(0).nodeName === CONST.SELECTOR.INPUT) {
                obj.$selectors.input.val(data[obj.dataSource.model.text_field]);
                
                if (obj.$selectors.wrapper.hasClass(obj.settings.classes.cls_prefix + obj.settings.classes.open))
                    obj.$selectors.input.select();
            } else {
                if (obj.settings.show_value_path && !obj.$selectors.wrapper.hasClass(obj.settings.classes.cls_prefix + obj.settings.classes.open)) {
                    var path = obj.selected_value._path? obj.selected_value._path.join(obj.settings.path_divider) : CONST.EMPTY_STRING;

                    path = (path !== CONST.EMPTY_STRING)? path + obj.settings.path_divider : CONST.EMPTY_STRING;

                    var selected_value = $.extend(true, {}, obj.selected_value, { path: path }),
                        input_text = obj.settings.show_value_path? obj.renderTemplate(obj.settings.templates.value_path, selected_value) : obj.selected_value[obj.dataSource.model.text_field];

                    obj.$selectors.input.html(input_text);
                } else
                    obj.$selectors.input.text(data[obj.dataSource.model.text_field]);
                
                if (obj.$selectors.wrapper.hasClass(obj.settings.classes.cls_prefix + obj.settings.classes.open)){
                    var input = obj.$selectors.input.get(0);
                    if (document.body.createTextRange) {
                        var range = document.body.createTextRange();
                        range.moveToElementText(input);
                        range.select();
                    } else if (window.getSelection) {
                        var selection = window.getSelection(),
                            range = document.createRange();

                        range.selectNodeContents(input);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            }
        }

        function _startEventListeners() {
            obj.dataSource
                .on('loadingData', function(){
                    obj.$selectors.wrapper.addClass(obj.settings.classes.cls_prefix + obj.settings.classes.loading);
                }).on('dataLoaded', function(e, data){
                    obj.$selectors.wrapper.removeClass(obj.settings.classes.cls_prefix + obj.settings.classes.loading);
                    obj.selected_value = obj.dataSource.getBy(obj.dataSource.model.id_field, obj.$selectors.root.val());
                    
                    _buildResultsHtml();
                    obj.$selectors.results
                        .on(obj.settings.classes.cls_prefix + CONST.EVENT.FOCUS, function(e, index){
                            // TODO: There is a small problem with scrolling with arrows, especialy going up;
                            var $highlighted = obj.$selectors.results.filter(':eq(' + index + ')'),
                                elem_position = $highlighted.position().top + $highlighted.outerHeight(true),
                                container_position = obj.$selectors.dropdown.scrollTop() + obj.$selectors.dropdown.outerHeight(true),
                                scroll = obj.$selectors.dropdown.scrollTop() + obj.$selectors.dropdown.outerHeight(true);

                            if (index === 0) {
                                scroll = 0;
                                obj.$selectors.dropdown.scrollTop(scroll);
                            } else
                                if (elem_position - obj.$selectors.dropdown.outerHeight(true) > 0)
                                    obj.$selectors.dropdown.scrollTop(scroll);
                        }).on(CONST.EVENT.CLICK, function(e){
                            var $this = $(e.target),
                                selected_data = obj.dataSource.getBy(obj.dataSource.model.id_field, $this.data()[obj.dataSource.model.id_field]);

                            obj.highlight($this.index());
                            obj.setValue(selected_data);
                            obj.closeDropdown();
                        });
                });
            
            obj.$selectors.input_container.on(CONST.EVENT.CLICK, function(e){
                if ($(e.target).is(obj.$selectors.input_container))
                    if (!obj.$selectors.wrapper.hasClass(obj.settings.classes.cls_prefix + obj.settings.classes.open)) {
                        obj.openDropdown();
                    } else {
                        obj.closeDropdown();
                    }
            });
            
            obj.$selectors.input
                    .on(CONST.EVENT.FOCUS, function(){
                        obj.openDropdown();
                    }).on(CONST.EVENT.KEYDOWN, function(e){
                        return e.keyCode !== 13;
                    }).on(CONST.EVENT.KEYUP, function(e){
                        switch (e.keyCode) {
                            case CONST.KEYCODE.ARROW_DOWN:
                                // highlight next
                                var $highlighted = obj.$selectors.results.filter(CONST.SELECTOR.CLASS + obj.settings.classes.cls_prefix + obj.settings.classes.highlight),
                                    idx = $highlighted.index() + 1;
                                
                                if (idx >= obj.$selectors.results.length)
                                    idx = 0;
                                
                                obj.highlight(idx);
                                break;
                            case CONST.KEYCODE.ARROW_UP:
                                // highlight previous
                                var $highlighted = obj.$selectors.results.filter(CONST.SELECTOR.CLASS + obj.settings.classes.cls_prefix + obj.settings.classes.highlight),
                                    idx = $highlighted.index() - 1;
                                
                                if (idx >= obj.$selectors.results.length)
                                    idx = obj.$selectors.results.length - 1;
                                
                                obj.highlight(idx);
                                break;
                            case CONST.KEYCODE.ENTER:
                                var $highlighted = obj.$selectors.results.filter(CONST.SELECTOR.CLASS + obj.settings.classes.cls_prefix + obj.settings.classes.highlight),
                                    highlighted_data = $highlighted.data();
                                
                                if ($highlighted.length > 0) {
                                    highlighted_data.title = $highlighted.text();
                                    obj.setValue(highlighted_data);
                                } else
                                    obj.setValue({});
                                
                                obj.closeDropdown();
                                break;
                            default:
                                if (obj.$selectors.input.val() === CONST.EMPTY_STRING)
                                    obj.$selectors.results.removeClass(obj.settings.classes.cls_prefix + obj.settings.classes.highlight);
                                
                                obj.filter(obj.$selectors.input.text() || obj.$selectors.input.val());
                                break;
                        }
                    });
                    
            obj.$selectors.html.on(CONST.EVENT.CLICK, function(e){
                var $e_wrapper = $(e.target).parents(CONST.SELECTOR.CLASS + obj.settings.classes.cls_prefix + obj.settings.classes.wrapper);
                if (!$e_wrapper.is(obj.$selectors.wrapper))
                    obj.closeDropdown();
            });
        }

        this.enable = function () {
            return this;
        };

        this.disable = function () {
            return this;
        };

        this.destroy = function () {
            this.$selectors.root
                    .removeAttr('style')
                    .insertBefore(this.$selectors.wrapper)
                    .removeData(pluginName);
            this.$selectors.wrapper
                    .empty()
                    .remove();
            
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
                            return $1 || CONST.EMPTY_STRING;
                    });
                }
            } else {
                return CONST.EMPTY_STRING;
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