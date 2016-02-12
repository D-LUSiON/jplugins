//TODO: Да се обединят _filterResults и _setFilteredResults - няма смисъл да се обикаля още един път целия масив с данни;
//TODO: Да се измисли как да се добавят всички резултати на веднъж в dropdown-а, но да се запази на всеки елемент data-та;
//TODO: findSubstrWord да се замести с /(?:^|\W)блабла(\w+)(?!\w)/gi

/**
 * TITLE: Extended Autocomplete plugin
 * AUTHOR: Lubomir Peikov @ Web Fashion ltd.
 * VERSION: v1.3.9
 * COPYRIGHT: All rights reserved!
 * 
 * @param {object} $ - jQuery
 * @param {object} window
 * @param {object} document
 * @returns {object}
 */
if (!String.hasOwnProperty('findSubstrWord')) {
    String.prototype.findSubstrWord = function(value){
        if (value === '')
            return true;
        else {
            if (value.indexOf(' ') > -1) {
                value = value.split(' ');
                var val_tmp = [];
                for (var i = 0, max = value.length; i < max; i++)
                    if (value[i] !== '') val_tmp.push(value[i]);
                value = val_tmp;
            }
            if (value instanceof Array) value = value.join('|');
            
            return new RegExp('(^('+value+'))|(\\s{1,}('+value+'))', 'gi').test(this);
        }
    };
}
;(function($, window, document) {
    'use strict';
    var pluginName = 'ExAC',
        version = 'v1.3.9',
        dependancies = [],
        local_namespace = {};
    
    if (typeof window.Localization === 'undefined')
        window.Localization = {};
        
    window.Localization[pluginName] = {
        en: {
            add_new_record: '<div class="ExAC-record_not_found-container">Record not found</div>',
            not_found: ''
        },
        bg: {
            add_new_record: '<div class="ExAC-record_not_found-container">Record not found!</div>',
            not_found: '<div class="ExAC-record_not_found-container">Record not found!</div>'
        }
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
        /**
         * Default settings for the plugin
         * @type object
         */
        var defaults = {
            lang: 'en', // default language for localization
            results: [], // results data format = [{ id: 1, title: 'Some title', parent_id: 0|null }]
            localization: window.Localization[pluginName],
            send_data: '',
            get_results_data: {},
            get_method: 'POST',
            cross_domain: false,
            id_field: 'id',
            parent_id_field: 'parent_id',
            title_field: 'title',
            multipleSelect: false,
            multipleSelectVelueHolder: '',
            multipleSelectIdHolder: [],
            templates: {
                wrapper: '<div class="ExAC-main-container"/>',
                dropdown: {
                    dropdown: '<div class="ExAC-dropdown-main-container"/>',
                    container: '<div class="ExAC-dropdown-container"/>',
                    loading: '<div class="ExAC-dropdown-loading"></div>',
                    result: '<div class="ExAC-dropdown-result" data-id="[id]">'+
                                '<div class="ExAC-dropdown-result-title">[title]</div>'+
                            '</div>',
                    subresult: '',
                    add_new_record: '<div class="ExAC-dropdown-add_new_record-container"/>'
                },
                tag: '<div class="tag-container" data-id="[id]"/>',
                tag_remove: '<div class="remove"/>'
            },
            dropdown_open_root_class: 'drop-open',
            result_current_class: 'selected',
            animate: false,
            add_loading: true, // add "loading" class to main container while executing ajax
            populate: [],
            parent_selectable: true,
            parent_selectable_class: 'not_selectable',
            disabled_class: 'disabled',
            add_new_record: false,
            show_no_results_found: true,
            splitter: ' | ',
            search_whole_string: false,
            // TODO: Да търси стринг в началото на думата
            search_word: false,
            show_on_focus: true,
            onInit: function(){},
            onDataLoaded: function(){},
            onFocus: function(){},
            onKeyup: function(){},
            onClick: function(){},
            onAddNewRecord: function(){},
            onBlur: function(){}
        };
        var _ = {
            $elements: {
                body: $('body'),
                parent_form: null,
                root: $(element),
                wrapper: null,
                dropdown_container: null,
                dropdown: null,
                add_new_record: null,
                taggerContainer: null,
                tagContainer: $('<div class="tag-container"/>'),
                tagContainerRemove: $('<div class="remove"/>')
            },
            settings: $.extend(true, {}, defaults, options || {}),
            result_class: ''
        };
        
        this.results = [];
        this.to_set = [];
        this.t = null;
        this.initial_value = null;
        this.populate_initial_values = [];
        this.selected_item = {};
        
        /**
         * Initialization of the object
         * @returns {object} Returns plugin class
         */
        function __construct() {
            //Allow multiple select
            _getInitialValues();
            if (_.settings.multipleSelect) {
                _.settings.add_new_record = false;
                _.$elements.root.attr('placeholder', '...');
                _.$elements.root.wrap($('<div class="tagger-container ExAC"/>'));
                _.$elements.taggerContainer = _.$elements.root.parent();
                if (_.settings.populate.length > 0 && _.settings.populate[0][_.settings.id_field].val() !== "") {
                    _.settings.multipleSelectIdHolder = _.settings.populate[0][_.settings.id_field].val().split(',');
                };
            };
            
            if (_.settings.populate.length > 0)
                obj.selected_id = _.settings.populate[0][_.settings.id_field].val();
            
            _.$elements.parent_form = _.$elements.root.closest('form');
            var body_lang = _.$elements.body.attr('lang');
            if (body_lang !== '' && body_lang !== null && typeof body_lang !== 'undefined')
                _.settings.lang = body_lang;
            _.result_class = $(_.settings.templates.dropdown.result).attr('class');
            _buildHTML();
            
            if (typeof _.settings.results === 'string') {
                _getResults(function(){
                    if (_.$elements.root.val() === '' && _.settings.populate.length > 0)
                        _setValueFromPopulate();
                    
                    _eventListener();
                    _.settings.onInit(obj);
                    if (_.$elements.root.is(':focus')) _.$elements.root.trigger('focus');
                });
            } else if (typeof _.settings.results === 'object') {
                _processProvidedData(_.settings.results);
                _eventListener();
                _.settings.onInit(obj);
                if (_.$elements.root.is(':focus')) _.$elements.root.trigger('focus');
            } else {
                throw new Error('Please, provide valid results - url or data!');
            }
            
            
            return this;
        }
        
        function _getInitialValues(){
            obj.initial_value = _.$elements.root.val() || '';
            for (var i = 0, max = _.settings.populate.length; i < max; i++) {
                if (typeof obj.populate_initial_values[i] === 'undefined') obj.populate_initial_values[i] = {};
                for (var key in _.settings.populate[i])
                    obj.populate_initial_values[i][key] = _.settings.populate[i][key].val() || '';
            }
        };
        
        function _buildHTML(){
            
            _.$elements.root.attr('autocomplete', 'off').wrap(_.settings.templates.wrapper);
            _.$elements.wrapper = _.$elements.root.parent();
            _.$elements.dropdown_container = $(_.settings.templates.dropdown.dropdown);
            if (_.settings.multipleSelect) {
                _.$elements.dropdown_container.appendTo(_.$elements.taggerContainer);
            }
            else{
                _.$elements.dropdown_container.appendTo(_.$elements.wrapper);
            };
            _.$elements.dropdown = $(_.settings.templates.dropdown.container).appendTo(_.$elements.dropdown_container);
            _.$elements.add_new_record = $(_.settings.templates.dropdown.add_new_record).prependTo(_.$elements.dropdown_container);
        }
        
        function _getResults(callback, readUrl){
            _.settings.results = readUrl? readUrl : _.settings.results;

            if (_.settings.results instanceof Array) {
                obj.results = _.settings.results;
                if (typeof callback === 'function')
                    callback(_.settings.results);
            } else if (typeof _.settings.results === 'string') {
                var send_data = {};
                if (_.settings.send_data === '' || typeof _.settings.send_data === 'undefiend' || _.settings.send_data === null) {
                    for (var key in _.settings.get_results_data) {
                        if (typeof _.settings.get_results_data[key] === 'string' || typeof _.settings.get_results_data[key] === 'number' ||  typeof _.settings.get_results_data[key] === 'boolean') {
                            send_data[key] = _.settings.get_results_data[key];
                        } else if (['input', 'select', 'textarea'].indexOf(_.settings.get_results_data[key].get(0).nodeName.toLowerCase()) > -1) {
                            send_data[key] = _.settings.get_results_data[key].val();
                        }
                    }
                } else {
                    send_data = _.settings.send_data;
                }
                $.ajax({
                    url: _.settings.results,
                    data: send_data,
                    method: _.settings.get_method,
                    dataType: _.settings.cross_domain? 'jsonp' : 'json',
                    beforeSend: function(){
                        obj.addLoading();
                    },
                    success: function(response){
                        var data = response;
                        var processedResponse = _.settings.onDataLoaded(response);
                        if (typeof processedResponse === 'object')
                            data = processedResponse;
                        
                        _processProvidedData(data);
                        if (typeof callback === 'function')
                            callback(data, response);
                    },
                    error: function(a, b, c){
                        if (window.console && console.error)
                            console.error('Results not loaded! Error: ', b, c.message);
                    },
                    complete: function(){
                        if (_.settings.add_loading) _.$elements.wrapper.removeClass('loading');
                    }
                });
            }
        }
        
        function _setValueFromPopulate(){
            var populate_data = {};
            for (var i = 0, max = _.settings.populate.length; i < max; i++)
                for (var key in _.settings.populate[i])
                    populate_data[key] = parseFloat(_.settings.populate[i][key].val());
            
            for (var i = 0, max = obj.results.length; i < max; i++) {
                var found = false;
                
                //TODO: В момента работи само, когато има един populate input, например за ID.
                //      Трябва да се направи по- сериозна проверка дали всички ключове съвпадат
                //      с търсения резултат и тогава да се сет-ват.
                for (var key in populate_data) {
                    if (obj.results[i].hasOwnProperty(key) && obj.results[i][key] === populate_data[key]) {
                        found = obj.results[i];
                        break;
                    }
                }
                if (found)
                    _.$elements.root.val(found[_.settings.title_field]);
            }
        }
        
        function _processProvidedData(data){
            if (data !== null && typeof data[0] === 'string') {
                for (var i = 0, max = data.length; i < max; i++)
                    obj.results[i] = { id: i+1, parent_id: null, title: data[i] };
            } else
                obj.results = (data !== null)? data : [];
            var res = _filterResults(_.$elements.root.val());
            _.$elements.dropdown.empty();
            for (var i = 0, max = res.length; i < max; i++){
                if (_.settings.populate.length > 0 &&  _.settings.populate[0][_.settings.id_field].is( "input" )) {
                    _initSavedItems(res[i], _.settings.populate[0][_.settings.id_field].val().split(','));
                };
                if (_.$elements.dropdown.is(':visible'))
                    _addResult(res[i], _.$elements.root.val());
            }
        }
        
        function _initSavedItems( item, ids){
            if (_.settings.multipleSelect) {
                $.each(ids, function(index, id){
                    if (item[_.settings.id_field] === id) obj.addTag(item[_.settings.title_field], item[_.settings.id_field]);
                });
            } else {
                if (item[_.settings.id_field] === ids[0]) _.$elements.root.val(item[_.settings.title_field]);
            }
        }

        function _addResult(data, value){
            if (_.$elements.dropdown.find('[data-id="'+data[_.settings.id_field]+'"]').length === 0) {
                var $to_append,
                    populateIds;
                
                var html = _.settings.templates.dropdown.result.replace(/\[(.+?)\]/gi, function($0, $1){
                    if ($1 === 'title' && value !== '' && typeof value !== 'undefined') {
                        var reg;
                        if (_.settings.search_word) {
                            if (value.indexOf(' ') > -1) {
                                value = value.split(' ');
                                var val_tmp = [];
                                for (var i = 0, max = value.length; i < max; i++)
                                    if (value[i] !== '') val_tmp.push(value[i]);
                                value = val_tmp;
                            }
                            if (value instanceof Array) value = value.join('|');
                        }
                        reg = new RegExp(_.settings.search_word? '(^('+value+'))|(\\s{1,}('+value+'))' : value, 'gi');
                        return data[$1].replace(reg, function(_0){
                            return '<span class="highlight">'+_0+'</span>';
                        });
                    } else {
                        return data[$1];
                    }
                });
                var $target = (data[_.settings.parent_id_field] > 0 && data[_.settings.parent_id_field] !== null) ? _.$elements.dropdown.find('[data-id="'+data[_.settings.parent_id_field]+'"]') : _.$elements.dropdown;
                
                $to_append = $(html);

                if (_.settings.populate.length > 0 && _.settings.populate[0][_.settings.id_field].is('input')) {
                    populateIds = _.settings.populate[0][_.settings.id_field].val().split(',');
                    if (populateIds.indexOf(data[_.settings.id_field]) > -1)
                        $to_append.addClass('check');
                };

                if (!_.settings.parent_selectable && (data[_.settings.parent_id_field] === 0 || data[_.settings.parent_id_field] === null))
                    $to_append.addClass(_.settings.parent_selectable_class);
                $to_append.data('ExAC-result', data).appendTo($target);
            }
        };
        
        this.addTag = function(text, id){
            var $new_element = $(_.settings.templates.tag.replace(/\[id\]/gi,id));
            $new_element.text(text).append(_.settings.templates.tag_remove).prependTo(_.$elements.taggerContainer);
        };
        
        this.removeTag = function($element, id){
            var item_id = $element.parent().data('id');
            var indexOfObjId = _.settings.multipleSelectIdHolder.indexOf(item_id);
            _.settings.multipleSelectIdHolder.splice(indexOfObjId, 1);
            if (_.settings.populate.length > 0) {
                for (var j = 0, max = _.settings.populate.length; j < max; j++) {
                    for (var key in _.settings.populate[j]){
                         _.settings.populate[j][key].val(_.settings.multipleSelectIdHolder).trigger('change');
                    }
               }
            }
            setTimeout(function(){
                $element.parent().remove();
            }, 10);
        };

        this.setData = function(results){
            if (typeof results === 'object') {
                obj.results = results;
            } else {
                if (window.console && console.error)
                    console.error('Please, provide valid JSON!');
            }
        };
        
        function _emptyPopulate(){
            if (_.settings.populate.length > 0) {    
                $.each(_.settings.populate, function (index, item) {
                    for (var key in item)
                        item[key].val(obj.populate_initial_values[index][key]);
                });
            };
        }

        this.updateData = function(callback, readUrl){
            obj.results = [];

            _.settings.multipleSelectIdHolder = [];
            _getResults(function(){
                if (_.settings.multipleSelect)
                    _.$elements.taggerContainer.find('.tag-container').remove();
                else
                    _.$elements.root.val(obj.initial_value);
                _setValueFromPopulate();
                if (typeof callback === 'function') callback();
            }, readUrl);
        };

        this.reloadData = function(){
            obj.results = [];
            _getResults();
        };
        
        this.enable = function(){
            _.$elements.root.attr('disabled', false);
            _.$elements.wrapper.removeClass(_.settings.disabled_class);
        };
        
        this.disable = function(){
            _.$elements.root.attr('disabled', true);
            _.$elements.wrapper.addClass(_.settings.disabled_class);
        };
        
        function _filterResults(value, parent_value){
            parent_value = (!parent_value)? '' : parent_value;
            var found = [];
            var inserted = [];
            var parents = [];
            if (_.settings.search_word && value === '') return [];
            for (var i = 0, max = obj.results.length; i < max; i++) {
                // find in all
                if (obj.results[i][_.settings.id_field] !== null && obj.results[i][_.settings.title_field] !== null) {
                    if ((_.settings.search_word)? obj.results[i][_.settings.title_field].findSubstrWord(value) : obj.results[i][_.settings.title_field].toLowerCase().indexOf(value.toLowerCase()) > -1) {
                        found.push(obj.results[i]);
                        inserted.push(obj.results[i][_.settings.id_field]);
                        if (parents.indexOf(obj.results[i][_.settings.parent_id_field]) === -1 && obj.results[i][_.settings.parent_id_field] !== null) {
                            parents.push(obj.results[i][_.settings.parent_id_field]);
                        }
                    }
                }
            }
            
            // find parents of found results
            for (var i = 0; i < found.length; i++) {
                if (found[i][_.settings.parent_id_field] !== null && inserted.indexOf(found[i][_.settings.parent_id_field]) === -1) {
                    for (var j = 0, max = obj.results.length; j < max; j++) {
                        if (obj.results[j][_.settings.id_field] === found[i][_.settings.parent_id_field]) {
                            inserted.push(obj.results[j][_.settings.id_field]);
                            found.push(obj.results[j]);
                            parents.push(found[i][_.settings.parent_id_field]);
                        }
                    }
                }
            }
            
            return found;
        }
        
        this.addLoading = function(){
            if (_.settings.add_loading) _.$elements.wrapper.addClass('loading');
            _.$elements.dropdown.html(_.settings.templates.dropdown.loading);
        };
        
        function _processDropdownContent(root, initial){
            root.select();
            obj.addLoading();
            
            var value = root.value;
            if (_.settings.show_on_focus && value) obj.showDropdown();
            var parent_value;
            if (value.indexOf(_.settings.splitter) > -1) {
                parent_value = value.split(_.settings.splitter)[0];
                value = value.split(_.settings.splitter)[1];
            }
            setTimeout(function(){
                _setFilteredResults((!initial? value : '') , parent_value);
            }, 10);
            
            if (_.settings.add_loading) _.$elements.wrapper.removeClass('loading');
            _.settings.onFocus(root.value);
        }
        
        this.showDropdown = function(){
            var method = (_.settings.animate)? 'slideDown' : 'show';
            _.$elements.dropdown_container[method]();
            _.$elements.wrapper.addClass(_.settings.dropdown_open_root_class);
            if (_.$elements.taggerContainer) {
                _.$elements.taggerContainer.addClass(_.settings.dropdown_open_root_class);
            };
            if (_.settings.multipleSelect) {
                _.$elements.taggerContainer.addClass('focus');
            }
        };
        
        this.hideDropdown = function(){
            var method = (_.settings.animate)? 'slideUp' : 'hide';
            _.$elements.dropdown_container[method]();
            _.$elements.wrapper.removeClass(_.settings.dropdown_open_root_class);
            
            if (_.$elements.taggerContainer) {
                _.$elements.taggerContainer.removeClass(_.settings.dropdown_open_root_class);
            }

            if (_.settings.multipleSelect) {
                _.$elements.taggerContainer.removeClass('focus');
            }
            
            // If user deletes value, remove populate input value
            if (_.$elements.root.val() === '' && !_.settings.multipleSelect && _.settings.populate && _.settings.populate.length > 0) {
                 _.settings.populate[0][_.settings.id_field].val(' ');
            }
            _.$elements.add_new_record.empty().hide();
            _.$elements.root.trigger('blur').one('focus', function(){
                _processDropdownContent(this, true);
            });
        };
        
        /**
         * 
         * @param {string} direction - "next" or "prev"
         * @returns {undefined}
         */
        this.highlight = function(direction){
            var $results = _.$elements.dropdown.find('.' + _.result_class).not('.' + _.settings.parent_selectable_class);
            var $current = $results.filter('.' + _.settings.result_current_class);
            var scroll = 0;
            switch (direction.toLowerCase()) {
                case 'next':
                    $results.removeClass(_.settings.result_current_class);
                    if ($current.length === 0) {
                        $current = $results.filter(':eq(0)').addClass(_.settings.result_current_class);
                    } else if ($current.next().length === 0) {
                        $current = $current.parent().next().children('.' + _.result_class + ':eq(0)').addClass(_.settings.result_current_class);
                    } else {
                        $current = $current.next().addClass(_.settings.result_current_class);
                    }
                    scroll = _.$elements.dropdown.scrollTop() - (_.$elements.dropdown.outerHeight() - $current.outerHeight()) + (($current.position()) ? $current.position().top : 0);
                    break;
                case 'prev':
                    $results.removeClass(_.settings.result_current_class);
                    if ($current.length === 0 || ($current.is(':eq(0)') && ($current.parent().is(':eq(0)')))) {
                        $current = $results.filter(':last').addClass(_.settings.result_current_class);
                    } else if ($current.prev().length === 0 || !$current.prev().hasClass(_.result_class)) {
                        $current = $current.parent().prev().children('.' + _.result_class + ':last').addClass(_.settings.result_current_class);
                    } else {
                        $current = $current.prev().addClass(_.settings.result_current_class);
                    }
                    scroll = ((_.$elements.dropdown.scrollTop() > _.$elements.dropdown.scrollTop() + $current.position().top) || (_.$elements.dropdown.scrollTop() +  _.$elements.dropdown.outerHeight() < _.$elements.dropdown.scrollTop() + $current.position().top)) ? _.$elements.dropdown.scrollTop() + $current.position().top : null;
                    break;
                default: break;
            }
            
            if (scroll !== null)_.$elements.dropdown.scrollTop(scroll);
        };
        
        function _setInputsData() {
            var root_text = '',
                found = false;
            
            root_text = obj.to_set[0][_.settings.title_field];

            _.$elements.root.val(root_text).trigger('change');

            if (_.settings.populate.length > 0) {
                for (var i = 0, max = _.settings.populate.length; i < max; i++) {
                    for (var key in _.settings.populate[i]){
                        if (key in obj.to_set[0]){
                             if (_.settings.multipleSelect) {
                                if (obj.to_set.length > 0) {
                                    _.settings.multipleSelectIdHolder.push(obj.to_set[0][key]);
                                }
                                 _.settings.populate[i][key].val(_.settings.multipleSelectIdHolder).trigger('change');
                             }
                             else{
                                _.settings.populate[i][key].val(obj.to_set[0][key]).trigger('change');
                             }
                        }
                    }
                }
            }

            /*start -> Multiple select*/
            if (_.settings.multipleSelect) {
                $.each(_.$elements.taggerContainer.find('.tag-container'), function( index, value){
                    if ($(value).data('id') === obj.to_set[0][_.settings.id_field]) {
                        found = true;
                        return;
                    };
                });
                if (!found) {
                    var objId = obj.to_set[0][_.settings.id_field];
                    obj.addTag(root_text, objId);
                };
                _.$elements.root.val('');
            }
            /*end -> Multiple select*/
            obj.to_set =[];
        }
        
        function _setFilteredResults(value, parent_value){
            var res = _filterResults(value, parent_value);
            _.$elements.dropdown.empty();
            if (_.settings.show_on_focus || (value !== '' && res.length > 0)) {
                obj.showDropdown();
            }
//            if (_.settings.show_on_focus || (_.$elements.dropdown.is(':hidden') && res.length > 0 ))
//                obj.showDropdown();
//            $.each(res, function(index, item, arr){
//                if (value.toLowerCase() === item[_.settings.title_field].toLowerCase()) {
//                    found = true;
//                    return;
//                };
//            });
            if (value !== '' && res.length === 0){
                // is NOT NEW
                var template = _.settings.add_new_record? 'add_new_record' : _.settings.show_no_results_found? 'not_found' : '';
                if (template !== '') _.$elements.add_new_record.html(_.settings.localization[_.settings.lang][template].replace(/\[value\]/gi, value)).show();
                res = _filterResults('');
            } else if (value === '') {
                // is NEW 
                _.$elements.add_new_record.empty().hide();
                _emptyPopulate();
            }
            for (var i = 0, max = res.length; i < max; i++){
                _addResult(res[i], value);
            }
            
            return res;
        }
        
        /**
         * @description Resets plugin to initial state or empties root input and populate selectors
         * @param {boolean} empty Whether to empty or not the root and populate selectors
         * @param {boolean} get_again_initial_values Whether to re-get the default values
         * @returns {object} Root selector
         */
        this.reset = function(empty, get_again_initial_values){
            _.$elements.root.val(empty? '' : obj.initial_value);
            if (_.$elements.taggerContainer) _.$elements.taggerContainer.find('.'+$(_.settings.templates.tag).attr('class')).remove();
            for (var i = 0, max = _.settings.populate.length; i < max; i++) {
                for (var key in _.settings.populate[i]) {
                    _.settings.populate[i][key].val(empty? '' : obj.populate_initial_values[i][key]);
                }
            }
            if (get_again_initial_values) _getInitialValues();
            return _.$elements.root;
        };
        
        /**
         * @description Same as "reset" method, but sets values as empty string
         * @returns {object} Root selector
         */
        this.empty = function(get_again_initial_values){
            return this.reset(true, get_again_initial_values);
        };
        
        /**
         * Event listeners initialization after everything is loaded
         * @returns {undefined}
         */
        function _eventListener() {

            _.$elements.parent_form.on('keyup keypress', function(e){
                if ((e.which || e.keyCode) === 13 && _.$elements.root.is(e.target)) {
                    e.preventDefault();
                    return false;
                }
            });

            /**
             * IE11 workaround - focus event loop
             */
            _.$elements.root.one('focus', function(){
                _processDropdownContent(this, true);
            })
            .on('click', function(){
                if (_.$elements.dropdown.not(':visible'))
                    _.$elements.root.trigger('focus');
            })
            .on('keyup', function(e){
                var code = e.which || e.keyCode;
                if (code === 13) e.preventDefault();
                var char = ((code >=65 && code <= 90) || (code >=48 && code <= 57) || (code >=187 && code <= 191) || (code >=187 && code <= 222) || code === 32) ? 'character' : (code >=37 && code <= 40)? 'arrow' : (code === 13)? 'enter' : 'special';
                var found_result_data = null;
                _.$elements.root.attr('data-id', null);
                switch (char) {
                    case 'character':
                        found_result_data = _setFilteredResults(this.value);
                        break;
                    case 'arrow':
                        if (code === 38) { // arrow up
                            obj.highlight('prev');
                        } else if (code === 40) { //arrow down
                            obj.highlight('next');
                        }
                        break;
                    case 'enter':
                        var $selected_element = _.$elements.dropdown.find('.' + _.result_class).not('.' + _.settings.parent_selectable_class).filter('.' + _.settings.result_current_class),
                            value = $selected_element.text();
                        found_result_data = $selected_element.data('ExACResult');
                        if (found_result_data) {
                            obj.selected_item = found_result_data;
                        } else {
                            obj.selected_item[_.settings.id_field] = obj.selected_item[_.settings.title_field] = this.value;
                        }
                        
                        _.$elements.root.val(obj.selected_item[_.settings.title_field]);
                        _setFilteredResults(value);
                        obj.hideDropdown();
                        break;
                    case 'special':
                        if (code === 8) { // back space
                            found_result_data = _setFilteredResults(this.value);
                        } else if (code === 27) { // escape
                            _.$elements.root.trigger('blur');
                            obj.hideDropdown();
                        }
                        break;
                    default: break;
                }
                _.settings.onKeyup(this.value, char, found_result_data);
            });
            
            if (_.settings.add_new_record) {
                _.$elements.add_new_record.on('click', function(){
                    obj.hideDropdown();
                    _.$elements.root.attr('data-id', null);
                    _.settings.onAddNewRecord(_.$elements.root.val());
                });
            }
            
            _.$elements.dropdown.on('click', '.' + $(_.settings.templates.dropdown.result).attr('class').replace(/\s/g, '.'), function(e){
                var $this = $(this);
                var this_data = $this.data('ExAC-result');
                obj.selected_item = this_data;
                if ((!_.settings.parent_selectable && this_data[_.settings.parent_id_field] > 0) || _.settings.parent_selectable) {
                    obj.to_set.push(this_data);
                    clearTimeout(obj.t);
                    obj.t = setTimeout(function(){
                        _.$elements.root.attr('data-id', obj.to_set[0][_.settings.id_field]);
                        _.settings.onClick(obj.to_set[0]);
                        _setInputsData();
                        obj.hideDropdown();
                    }, 10);
                }
            });
            
            _.$elements.body.on('click', function(e) {
                var $self = $(e.target);
                if ($self.parents('.' + $(_.settings.templates.wrapper).attr('class')).length === 0)
                    obj.hideDropdown();
                _.settings.onBlur(_.$elements.root.val());
            });
            
            if (_.settings.multipleSelect) {
                _.$elements.taggerContainer.on('click', '.'+($(_.settings.templates.tag_remove).attr('class')), function(){
                    var $this = $(this);
                    obj.removeTag($this);
                });
            }
        }
        
        this.getSelectedData = function(){
            return this.selected_item;
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
        
        this.customFunction = function(func_name, func){
            //if (typeof obj.prototype === 'undefined') obj.prototype = {};
            if (obj.hasOwnProperty(func_name)) {
                if (window.console && console.error) console.error('You cannot overwrite already defined custom function!');
            } else {
                obj[func_name] = func;
            }
        };

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
