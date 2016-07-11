(function ($, window) {
    window.getSystemDetails = function () {
        if (!window.jscs) {
            var unknown = '-';

            // screen
            var screenSize = '';
            if (screen.width) {
                width = (screen.width) ? screen.width : '';
                height = (screen.height) ? screen.height : '';
                screenSize += '' + width + " x " + height;
            }

            // browser
            var nVer = navigator.appVersion,
                nAgt = navigator.userAgent,
                browser = navigator.appName,
                version = '' + parseFloat(navigator.appVersion),
                majorVersion = parseInt(navigator.appVersion, 10),
                nameOffset,
                verOffset,
                ix;

            // Opera
            if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf('Version')) !== -1)
                    version = nAgt.substring(verOffset + 8);
            }
            // Opera Next
            if ((verOffset = nAgt.indexOf('OPR')) !== -1) {
                browser = 'Opera';
                version = nAgt.substring(verOffset + 4);
            }
            // MSIE
            else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(verOffset + 5);
            }
            // Chrome
            else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
                browser = 'Chrome';
                version = nAgt.substring(verOffset + 7);
            }
            // Safari
            else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
                browser = 'Safari';
                version = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    version = nAgt.substring(verOffset + 8);
                }
            }
            // Firefox
            else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
                browser = 'Firefox';
                version = nAgt.substring(verOffset + 8);
            }
            // MSIE 11+
            else if (nAgt.indexOf('Trident/') !== -1) {
                browser = 'Microsoft Internet Explorer';
                version = nAgt.substring(nAgt.indexOf('rv:') + 3);
            }
            // Other browsers
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browser = nAgt.substring(nameOffset, verOffset);
                version = nAgt.substring(verOffset + 1);
                if (browser.toLowerCase() === browser.toUpperCase()) {
                    browser = navigator.appName;
                }
            }
            // trim the version string
            if ((ix = version.indexOf(';')) !== -1)
                version = version.substring(0, ix);
            if ((ix = version.indexOf(' ')) !== -1)
                version = version.substring(0, ix);
            if ((ix = version.indexOf(')')) !== -1)
                version = version.substring(0, ix);

            majorVersion = parseInt('' + version, 10);
            if (isNaN(majorVersion)) {
                version = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            // mobile version
            var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

            // cookie
            var cookieEnabled = (navigator.cookieEnabled) ? true : false;

            if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
                document.cookie = 'testcookie';
                cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
            }

            // system
            var os = unknown;
            var clientStrings = [
                {s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/},
                {s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/},
                {s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/},
                {s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/},
                {s: 'Windows Vista', r: /Windows NT 6.0/},
                {s: 'Windows Server 2003', r: /Windows NT 5.2/},
                {s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/},
                {s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/},
                {s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/},
                {s: 'Windows 98', r: /(Windows 98|Win98)/},
                {s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/},
                {s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
                {s: 'Windows CE', r: /Windows CE/},
                {s: 'Windows 3.11', r: /Win16/},
                {s: 'Android', r: /Android/},
                {s: 'Open BSD', r: /OpenBSD/},
                {s: 'Sun OS', r: /SunOS/},
                {s: 'Linux', r: /(Linux|X11)/},
                {s: 'iOS', r: /(iPhone|iPad|iPod)/},
                {s: 'Mac OS X', r: /Mac OS X/},
                {s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
                {s: 'QNX', r: /QNX/},
                {s: 'UNIX', r: /UNIX/},
                {s: 'BeOS', r: /BeOS/},
                {s: 'OS/2', r: /OS\/2/},
                {s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
            ];
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = unknown;

            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'Android':
                    osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;
            }

            // flash (you'll need to include swfobject)
            /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
            var flashVersion = 'no check';
            if (typeof swfobject !== 'undefined') {
                var fv = swfobject.getFlashPlayerVersion();
                if (fv.major > 0) {
                    flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
                } else {
                    flashVersion = unknown;
                }
            }

            window.jscs = {
                screen: screenSize,
                browser: browser,
                browserVersion: version,
                browserMajorVersion: majorVersion,
                mobile: mobile,
                os: os,
                osVersion: osVersion,
                cookies: cookieEnabled,
                flashVersion: flashVersion
            };
        }

        return window.jscs;
    };
    
    if (!String.escapeSpecialChars)
        String.defineProperty(String.prototype, 'escapeSpecialChars', {
            value: function () {
                this.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            },
            enumerable : false
        });
    
    if (!Object.getByString)
        Object.defineProperty(Object.prototype, 'getByString', {
            value: function (str) {
                str = str.replace(/^\./, '')
                         .replace(/\[(\w+)\]/g, '.$1');
                var str_array = str.split('.'),
                    obj = this;
                for (var i = 0, max = str_array.length; i < max; i++) {
                    if (str_array[i] in obj)
                        obj = obj[str_array[i]];
                    else
                        return;
                }
                return obj;
            },
            enumerable : false
        });
    
    /**
     * Converts RGB values to HEX color
     * @param {integer} r Red value
     * @param {integer} g Green value
     * @param {integer} b Blue value
     * @returns {String}
     */
    window.rgbToHex = function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    
    /**
     * Converts HEX color to RGB
     * @param {string} hex HEX color value
     * @returns {object}
     */
    window.hexToRgb = function(hex){
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {};
    };
    
    if (!Date.prototype.hasOwnProperty('formatDate')) {
        Date.prototype.localization = {
            months: {
                full: {
                    'en-US': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    'bg-BG': ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември']
                },
                short: {
                    'en-US': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    'bg-BG': ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек']
                }
            },
            weekdays: {
                full: {
                    'en-US': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    'bg-BG': ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя']
                },
                short: {
                    'en-US': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    'bg-BG': ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед']
                }
            }
        };
        
        Date.prototype.formatDate = function(format, locale){
            if (!format)
                format = 'YYYY-MM-DD HH:mm:ss, i';

            var self = this,
                date_str = format,
                lang = locale || document.getElementsByTagName('body')[0].getAttribute('lang'),
                date_elements = {
                    YYYY: self.getFullYear(),
                    YY: self.getFullYear().toString().substr(2,2),
                    MMMM: self.localization.months.full[lang || navigator.language][self.getMonth()],
                    MMM: self.localization.months.short[lang || navigator.language][self.getMonth()],
                    MM: ((self.getMonth() + 1 < 10)? '0' + (self.getMonth() + 1 ) : (self.getMonth() + 1)),
                    M: self.getMonth() + 1,
                    DD: ((self.getDate() < 10)? '0' + self.getDate() : self.getDate()),
                    D: self.getDate(),
                    HH: ((self.getHours() < 10) ? '0' + self.getHours() : self.getHours()),
                    H: self.getHours(),
                    mm: ((self.getMinutes() < 10) ? '0' + self.getMinutes() : self.getMinutes()),
                    m: self.getMinutes(),
                    ss: ((self.getSeconds() < 10) ? '0' + self.getSeconds() : self.getSeconds()),
                    s: self.getSeconds(),
                    ms: self.getMilliseconds(),
                    ii: self.localization.weekdays.full[lang || navigator.language][self.getDay() - 1],
                    i: self.localization.weekdays.short[lang || navigator.language][self.getDay() - 1]
                };

            return  date_str.replace(/\w{1,}/g, function ($0, $1) {
                return date_elements[$0] || $0;
            });
        };
        
    }
    
})(jQuery, window);