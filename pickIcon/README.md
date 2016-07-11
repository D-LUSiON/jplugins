# jquery.pickIcon.js documentation

## Description:
<div>
    There are a lot of icon fonts. With this plugin you can select an icon from font and set it to input.
</div>
<h2>Usage:</h2>
<div>
    <p>First you have to include necessary stylesheet:</p>
    ```
    <link rel="stylesheet" type="text/css" href="path/to/your/css/jquery.pickIcon.css" media="all">
    ```
</div>
<div>
    <p>Then add jQuery and plugin:</p>
    ```
    <script type="text/javascript" src="path/to/your/js/jquery.js"></script>
    
    <script type="text/javascript" src="path/to/your/js/jquery.pickIcon.js"></script>
    ```
</div>
<div>
    <p>After that create the markup:</p>
    ```
    <input type="hidden" value="" class="selector_of_your_choosing"/>
    ```
</div>
<div>
    <p>And finally initialize plugin on an element:</p>
    ```javascript
        $(function(){
            $('.selector_of_your_choosing').pickIcon();
        });
    ```
</div>
## API:

### Plugin options:
<div>
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <th style="width: 10%;">Option</th>
            <th style="width: 10%;">data type</th>
            <th style="width: 10%;">Default value</th>
            <th>Values</th>
            <th>Description</th>
            <th>Example</th>
        </tr>
        <tr>
            <td>lang</td>
            <td>string</td>
            <td>'en-US'</td>
            <td>any language code</td>
            <td>localization language</td>
            <td>$('.iconPicker').pickIcon({ lang: 'de-DE' })</td>
        </tr>
        <tr>
            <td>clickable</td>
            <td>boolean</td>
            <td>true</td>
            <td>true/false</td>
            <td>set to 'false' if you want to pick icon only with hover</td>
            <td>$('.iconPicker').pickIcon({ clickable: false })</td>
        </tr>
        <tr>
            <td>filterable</td>
            <td>boolean</td>
            <td>true</td>
            <td>true/false</td>
            <td>set to 'false' if you don't want to show the filter field</td>
            <td>$('.iconPicker').pickIcon({ filterable: false })</td>
        </tr>
        <tr>
            <td>show_icon_title</td>
            <td>boolean</td>
            <td>false</td>
            <td>true/false</td>
            <td>set to 'true' if you want to show the title of the selected icon</td>
            <td>$('.iconPicker').pickIcon({ show_icon_title: true })</td>
        </tr>
        <tr>
            <td>cdn</td>
            <td>object</td>
            <td>a set of predefined icon fonts</td>
            <td></td>
            <td>this is the container of all icon fonts you want to choose from</td>
            <td></td>
        </tr>
        <tr>
            <td>cdn[icon_font_name]</td>
            <td>object</td>
            <td></td>
            <td></td>
            <td>set the icon font name as key of this object</td>
            <td>
                $('.iconPicker').pickIcon({
                    cdn: {
                        glyphicons: {
                            ...
                        }
                    }
                })
            </td>
        </tr>
        <tr>
            <td>cdn[icon_font_name].title</td>
            <td>string</td>
            <td></td>
            <td></td>
            <td>set the icon font title</td>
            <td>
                $('.iconPicker').pickIcon({
                    cdn: {
                        glyphicons: {
                            title: 'GlyphIcons'
                        }
                    }
                })
            </td>
        </tr>
        <tr>
            <td>cdn[icon_font_name].selector</td>
            <td>string</td>
            <td></td>
            <td></td>
            <td>some fonts have main selector for the icons, for example FontAwesome have '.fa' class in addition to '.fa-...' icon. Use empty string if the font doesn't have such selector</td>
            <td>
                $('.iconPicker').pickIcon({
                    cdn: {
                        glyphicons: {
                            selector: 'glyphicons'
                        }
                    }
                })
            </td>
        </tr>
        <tr>
            <td>cdn[icon_font_name].icon_selector</td>
            <td>string</td>
            <td></td>
            <td></td>
            <td>that's the prefix of the icon class. For FontAwesome is 'fa-', for GlyphIcons - 'glyphicons-'</td>
            <td>
                $('.iconPicker').pickIcon({
                    cdn: {
                        glyphicons: {
                            selector: 'glyphicons-'
                        }
                    }
                })
            </td>
        </tr>
        <tr>
            <td>cdn[icon_font_name].url</td>
            <td>string</td>
            <td></td>
            <td></td>
            <td>path to the .css file with the icon font</td>
            <td>
                $('.iconPicker').pickIcon({
                    cdn: {
                        glyphicons: {
                            url: 'path/to/your/css/glyphicons.css'
                        }
                    }
                })
            </td>
        </tr>
        <tr>
            <td>classes</td>
            <td>object</td>
            <td></td>
            <td></td>
            <td>a set of DOM element classes</td>
            <td>
                $('.iconPicker').pickIcon({
                    classes: {
                        ...
                    }
                })
            </td>
        </tr>
        <tr>
            <td>classes.disabled</td>
            <td>string</td>
            <td>'pickIcon-disabled'</td>
            <td>any class string</td>
            <td>This class will be added to the container when the picker is disabled</td>
            <td>
                $('.iconPicker').pickIcon({
                    classes: {
                        disabled: 'my_disabled_class'
                    }
                })
            </td>
        </tr>
        <tr>
            <td>classes.clickable</td>
            <td>string</td>
            <td>'clickable'</td>
            <td>any class string</td>
            <td>This class will be added if the option 'clickable' is enabled (the dropdown will be show when is clicked on the icon selector)</td>
            <td>
                $('.iconPicker').pickIcon({
                    classes: {
                        clickable: 'my_clickable_class'
                    }
                })
            </td>
        </tr>
        <tr>
            <td>classes.icon_in_list</td>
            <td>string</td>
            <td>'clickable'</td>
            <td>any class string</td>
            <td>This class is added to the icons in the dropdown list</td>
            <td>
                $('.iconPicker').pickIcon({
                    classes: {
                        clickable: 'my_icon_in_list_class'
                    }
                })
            </td>
        </tr>
        <tr>
            <td>classes.no_icon</td>
            <td>string</td>
            <td>'none'</td>
            <td>any class string</td>
            <td>This class is added if there is no icon selected</td>
            <td>
                $('.iconPicker').pickIcon({
                    classes: {
                        no_icon: 'my_no_icon_class'
                    }
                })
            </td>
        </tr>
        <tr>
            <td>templates</td>
            <td>object</td>
            <td></td>
            <td></td>
            <td>Container for the templates that are used for building the picker HTML</td>
            <td>
                $('.iconPicker').pickIcon({
                    templates: {
                        ...
                    }
                })
            </td>
        </tr>
        <tr>
            <td>templates.wrap</td>
            <td>string</td>
            <td>&lt;div class="pickIcon-container"/&gt;</td>
            <td></td>
            <td>Wrapper of the whole picker</td>
            <td>
                $('.iconPicker').pickIcon({
                    templates: {
                        wrap: '&lt;div class="icon_picker-wrap"/&gt;'
                    }
                })
            </td>
        </tr>
        <tr>
            <td>templates.selected_icon_wrap</td>
            <td>string</td>
            <td>&lt;div class="pickIcon-selected"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.selected_icon</td>
            <td>string</td>
            <td>&lt;span class="pickIcon-icon"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.selected_icon_title</td>
            <td>string</td>
            <td>&lt;span class="pickIcon-title"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.dropdown_container</td>
            <td>string</td>
            <td>&lt;div class="pickIcon-dropdown"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.filter</td>
            <td>string</td>
            <td>&lt;input type="text" class="pickIcon-filter" placeholder="|%filter%|"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.icons_list</td>
            <td>string</td>
            <td>&lt;div class="pickIcon-dropdown_list"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.icon</td>
            <td>string</td>
            <td>&lt;span class="[[sys_class]] [[selector]] [[icon_selector]][[icon]]" title="[[title]]" data-selector="[[selector]]" data-icon_selector="[[icon_selector]]" data-alias="[[alias]]"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.icon_none</td>
            <td>string</td>
            <td>&lt;span class="[[sys_class]] none" title="|%remove_icon%|"/&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>templates.link</td>
            <td>string</td>
            <td>&lt;link rel="stylesheet" type="text/css" href="[[link]]" media="all" crossorigin="anonymous"&gt;</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </table>
</div>
