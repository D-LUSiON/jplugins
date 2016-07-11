# jquery.pickIcon.js documentation

## Description:
There are a lot of icon fonts. With this plugin you can select an icon from font and set it to input.

## Usage:
First you have to include necessary stylesheet:
```html
<link rel="stylesheet" type="text/css" href="path/to/your/css/jquery.pickIcon.css" media="all">
```

Then add jQuery and plugin:
```html
<script type="text/javascript" src="path/to/your/js/jquery.js"></script>
<script type="text/javascript" src="path/to/your/js/jquery.pickIcon.js"></script>
```

After that create the markup:
```html
<input type="hidden" value="" class="selector_of_your_choosing"/>
```

And finally initialize plugin on an element:
```html
<script type="text/javascript">
    $(function(){
        $('.selector_of_your_choosing').pickIcon();
    });
</script>
```

## Default options values:
```javascript
{
    lang: 'en-US',
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
    },
    classes: {
        disabled: 'pickIcon-disabled',
        clickable: 'clickable',
        icon_in_list: 'pickIcon-icon',
        no_icon: 'none'
    },
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
    clickable: true,
    filterable: true,
    show_icon_title: false
}
```
## API:

### Plugin options:
_(string)_ **lang**: 'en-US'<br/>
Localization language - it can be any language code. Preferably, it have to be as defined by [W3](https://www.w3.org/International/articles/language-tags/) in format 'language'-'region'
```javascript
$('.iconPicker').pickIcon({
    lang: 'de-AT'
});
```

_(bool)_ **clickable**: true<br/>
How to open dropdown - _(true)_ on click or _(false)_ - on mouse over
```javascript
$('.iconPicker').pickIcon({
    clickable: false
});
```

_(bool)_ **filterable**: true<br/>
If you don't want to show the "filter" input field in dropdown, set this to _false_
```javascript
$('.iconPicker').pickIcon({
    filterable: false
});
```

_(bool)_ **show_icon_title**: false<br/>
If you wish to show the title of the choosen icon, set this to _true_
```javascript
$('.iconPicker').pickIcon({
    show_icon_title: true
});
```

_(object)_ **cdn**: { ... }<br/>
Container object for icon libraries. Look ahead for it's keys...
```javascript
$('.iconPicker').pickIcon({
    cdn: {
        ...
    }
});
```

_(object)_ **cdn[_font_key_]**: { ... }<br/>
Key of the font. For example, if you want to include "GlyphIcons" it might be "glyphicons" or "gi" (of your choosing).
```javascript
$('.iconPicker').pickIcon({
    cdn: {
        glyphicons: {
            ...
        }
    }
});
```

_(string)_ **cdn[_font_key_].title**: 'Title of the icon font library'<br/>
The title of the library that is going to be shown to the users
```javascript
$('.iconPicker').pickIcon({
    cdn: {
        glyphicons: {
            title: 'GlyphIcons'
        }
    }
});
```

_(string)_ **cdn[_font_key_].selector**: 'selector_class'<br/>
Some icon fonts have main selector class, for example:
```html
<span class="fa fa-times"></span>
```
You can define it here. If the font does not have, leave it empty string.
```javascript
$('.iconPicker').pickIcon({
    cdn: {
        glyphicons: {
            selector: 'glyphicon'
        }
    }
});
```

_(string)_ **cdn[_font_key_].icon_selector**: 'icon_selector_class_prefix'<br/>
Prefix of the icon class. For example, FontAwesome's prefix is "fa-", GlyphIcons is "glyphicon-"
```javascript
$('.iconPicker').pickIcon({
    cdn: {
        glyphicons: {
            icon_selector: 'glyphicon-'
        }
    }
});
```

_(string)_ **cdn[_font_key_].url**: 'some_url'<br/>
Path to the font CSS. It can be local or it can be from CDN. If it's on another domain (CDN) the server have to provide **"Access-Control-Allow-Origin: *"** header.
```javascript
$('.iconPicker').pickIcon({
    cdn: {
        glyphicons: {
            url: 'path/to/your/css/glyphicons.css'
        }
    }
});
```