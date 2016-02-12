(function($){
    var Checkbox = function(element, options) {
        var obj = this;
        var defaults = {
            wrapper: '<span class="checkbox_bg [[status]]"/>',
            onChange: function() {}
        };
        
        this.status = false;
        var $elements = {
            checkbox: $(this),
            wrapper: null
        };
        
        var settings = $.extend(defaults, options || {});
        
        function _construct(){
            obj.wrapElement();
            _eventListener();
        };
        
        this.wrapElement = function(){
            this.getStatus();
            $elements.checkbox.wrap(settings.wrapper.replace(/\[\[status\]\]/g, this.status));
            $elements.wrapper = $elements.checkbox.parent();
        };
        
        this.getStatus = function(){
            var checked = $elements.checkbox.attr('checked');
            obj.status = (checked || checked == 'checked') ? ' checked' : false;
        };
        
        this.setStatus = function() {
            obj.status = (obj.status == '')? 'checked' : false;
            $elements.checkbox.attr('checked', this.status).change();
        };
        
        function _changeState() {
            obj.setStatus();
            $elements.checkbox.parent().toggleClass('checked');
        };
        
        function _eventListener() {
            $elements.wrapper.on('click', function(){
                console.log('event');
                _changeState();
                settings.onChange($elements.checkbox);
            });
        };
        
        _construct();
    };
    
    $.fn.cCheckbox = function(options, parameters){
        return this.each(function(){
            var element = $(this); 
            if (element.data('cCheckbox')) {
                if (options != 'init' && eval('typeof '+ element.data('cCheckbox')[options]) == 'function') 
                    element.data('cCheckbox')[options](parameters);
            } else {
                var cCheckbox = new Checkbox(this, options);
                element.data('cCheckbox', cCheckbox);
            };
        });
    };
})(jQuery);