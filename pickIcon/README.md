# jquery.pickIcon.js documentation

## Description:
There are a lot of icon fonts. With this plugin you can select an icon from font and set it to input.

## Usage:
First you have to include necessary stylesheet:
```
<link rel="stylesheet" type="text/css" href="path/to/your/css/jquery.pickIcon.css" media="all">
```

Then add jQuery and plugin:
```
<script type="text/javascript" src="path/to/your/js/jquery.js"></script>
<script type="text/javascript" src="path/to/your/js/jquery.pickIcon.js"></script>
```

After that create the markup:
```
<input type="hidden" value="" class="selector_of_your_choosing"/>
```

And finally initialize plugin on an element:
```javascript
    $(function(){
        $('.selector_of_your_choosing').pickIcon();
    });
```
## API:

### Plugin options:
_(string)_ **lang**: 'en-US'

Localization language
```javascript
$('.iconPicker').pickIcon({ lang: 'de-DE' })
```