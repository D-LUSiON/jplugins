(function($){
    var CustomRadio = function(element, options) {
        var $elem = $(element);
        var elem = this;
        var defaults = {
            wrapClass: 'custom_radio_click',
            radioStyledClass: 'radio_bg',
            radioTitleClass: 'plan_price',
            onChange: function(){}
        };
        
        // public class parameters
        this.unchangable = $elem.attr('data-unchangable');
        
        // private class parameters
        var settings = $.extend(defaults, options || {});
        var $wrapper = null;
        
        // public functions
        this.init = function(){
            $wrapper = _wrapElement();
            $wrapper.click(function(){
                //console.log($elem.attr('data-unchangable'), typeof $elem.attr('data-unchangable'), Boolean($elem.attr('data-unchangable')));
                if (!$elem.attr('disabled') && !Boolean($elem.attr('data-unchangable'))) _changeState($elem.attr('checked'));
            });
            $elem.on('changeState', function(e, data){
                if (!$elem.attr('disabled')) {
                    _changeState(data);
                }
            });
        }
        
        // private functions
        function _wrapElement() {
            $elem.wrap('<label class="'+settings.wrapClass+' '+$elem.attr('name')+'">');
            var $wrapper = $elem.parent();
            var $radioBg = $('<label class="'+settings.radioStyledClass+'"/>').appendTo($wrapper);
            ($elem.attr('checked'))? $radioBg.addClass('checked'): '';
            $wrapper.append('<label class="'+settings.radioTitleClass+'">'+$elem.attr('data-title')+'</label>');
            //$wrapper.disableSelection();
            return $wrapper;
        };
        
        function _decheckAll(){
            var $rootForm = $wrapper.parents('form');
            var name = $wrapper.attr('class').replace(settings.wrapClass + ' ', '');
            $rootForm.find('input[name='+name+']').attr('checked', false);
            $rootForm.find('.'+name).find('.'+settings.radioStyledClass).removeClass('checked');
        }
        
        function _changeState(state) {
            if (state == 'checked') {
                $elem.attr('checked', false);
                $wrapper.find('.'+settings.radioStyledClass).removeClass('checked');
            } else {
                _decheckAll();
                $elem.attr('checked', true);
                $wrapper.find('.'+settings.radioStyledClass).addClass('checked');
            }
            settings.onChange($elem);
        };
    };
    
    $.fn.cRadio = function(options){
        return this.each(function(){
            var element = $(this);
            if (element.data('cRadio')) return;
            var cRadio = new CustomRadio(this, options);
            cRadio.init();
            element.data('cRadio', cRadio);
        });
    };
})(jQuery);