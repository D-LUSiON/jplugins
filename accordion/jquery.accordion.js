(function($){
    var Accordion = function(element, options){
        var obj = this;
        var defaults = {
            classes: {
                item_container: 'accordion-item',
                item_text: 'accordion-item-text',
                item_dropdown: 'accordion-item-dropdown',
                arrow: 'arrow',
                remove: 'remove'
            },
            allowClickOnChildren: true,
            collapseOther: true,
            addDownArrow: true,
            downArrowPosition: 'right',
            downArrowOpen: '&#9658;',
            downArrowClosed: '&#9660;',
            clickOnArrow: true,
            addClass: false,
            use_mCustomScrollbar: false,
            onInit: function(){},
            onBeforeOpenDrop: function(){},
            onAfterOpenDrop: function(){},
            onBeforeRemoveItem: function(){},
            onAfterRemoveItem: function(){}
        };
        var settings = $.extend(defaults, options || {});
        var _ = {
            $elements: {
                root: $(element),
                items: null
            }
        };
        function __construct(){
            _.$elements.items = _.$elements.root.children('.'+settings.classes.item_container);
            _.$elements.items.each(function(){
                var $this = $(this);
                if (settings.addDownArrow && $this.children('.'+settings.classes.item_dropdown).length > 0) {
                    $this.children('.'+settings.classes.item_text).prepend('<span class="'+settings.classes.arrow+' '+settings.downArrowPosition+'">'+settings.downArrowClosed+'</span>');
                };
            });
            if (settings.use_mCustomScrollbar) {
                _.$elements.items.children('.'+settings.classes.item_dropdown).mCustomScrollbar({
                    theme: 'dark'
                });
            };
            _startEventListener();
            settings.onInit(_.$elements);
        };
        
        function _slideToggleDropdown($el){
            settings.onBeforeOpenDrop($el);
            if (settings.collapseOther) {
                _.$elements.items.children('.'+settings.classes.item_text).not($el).each(function(){
                    var $that = $(this);
                    if (settings.addDownArrow) {
                        $that.children('.'+settings.classes.arrow).html(settings.downArrowClosed);
                    }
                    $that.next().slideUp(function(){
                        if (settings.addClass)
                            $that.parent().removeClass(settings.addClass);
                    });
                });
            };
            if (settings.addClass) {
                if ($el.next().is('.'+settings.classes.item_dropdown)) {
                    $el.parent().toggleClass(settings.addClass);
                };
            };
            $el.next().slideToggle(400, function(){
                settings.onAfterOpenDrop($el, ($el.next().is(':visible'))? 'open' : 'closed');
                if (settings.addDownArrow) {
                    $el.children('.'+settings.classes.arrow).html(($el.next().is(':visible'))? settings.downArrowOpen : settings.downArrowClosed);
                };
                if (settings.use_mCustomScrollbar) {
                    $el.next().mCustomScrollbar('update');
                };  
                _.$elements.root.trigger('resize');
            });
        };
        
        this.removeItem = function($item){
            $item.fadeOut(400, function(){
                $item.remove();
                settings.onAfterRemoveItem();
            });
        };
        
        function _startEventListener(){
            _.$elements.items.children('.'+settings.classes.item_text).on('click', function(e){
                var $this = $(this);
                var $e_target = $(e.target);
                if (settings.allowClickOnChildren) {
                    _slideToggleDropdown($this);
                } else {
                    /**
                    * Ако е позволено в сетингите да се кликва на стрелката и е кликнато на стрелката или на елемент в стрелката
                    * или
                    * е кликнато на '.'+settings.classes.item_text
                    */
                   if ((settings.clickOnArrow && ($e_target.hasClass(settings.classes.arrow) || $e_target.parents('.'+settings.classes.arrow).length > 0)) || $e_target.parents('.'+settings.classes.item_text).length == 0) {
                       _slideToggleDropdown($this);
                   };
                };
            });
            _.$elements.items.on('click', '.'+settings.classes.remove, function(){
                var $this = $(this);
                var $root = $this.parents('.'+settings.classes.item_container);
                var onBeforeRemoveItem_callbackParam;
                settings.onBeforeRemoveItem($root, function(par){
                    onBeforeRemoveItem_callbackParam = par
                });
                if (onBeforeRemoveItem_callbackParam != 'stop') {
                    obj.removeItem($root);
                };
            });
            _.$elements.items.on('accordion.close', function(e, $el){
                _slideToggleDropdown($el.children('.'+settings.classes.item_text));
            }).on('accordion.closeAll', function(){
                //TODO: accordion.closeAll
            }).on('accordion.open', function(){
                //TODO: accordion.open
            }).on('accordion.openAll', function(){
                //TODO: accordion.openAll
            });
        };
        __construct();
    };
    $.fn.accordion = function(options, parameters){
        return this.each(function(){
            var element = $(this); 
            var elem_data = element.data('accord');
            if (elem_data) {
                if (eval('typeof '+ elem_data[options]) == 'function') 
                    element.data('accord')[options](parameters);
            } else {
                var accord = new Accordion(this, options);
                element.data('accord', accord);
            };
        });
    };
})(jQuery);