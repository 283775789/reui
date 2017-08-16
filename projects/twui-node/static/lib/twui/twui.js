/*! ------------------------------------------------------------
 *! 版本:1.0
 *! 描述:twui
 *! ------------------------------------------------------------ */
+function ($) {
    // 构造函数:用于构造twui对象实例
     window.twui = function (constructor) {
        var prefix = /^.jst-[a-zA-Z][a-zA-Z0-9]{0,19}$/,
            temp = new constructor(),
            selector = temp.selector;

        if (!prefix.test(selector)) {
            throw Error('选择器无效，请以".jst-"开头，然后输入组件名字（需符合js变量规则）!');
        }

        this.selector = selector;
        this.name = selector.substring(5);
        this.constructor = constructor;
    };

    // 构造twui组件
    twui.prototype.build=function ($initElements) {
        var $elements = $(),
            name = this.name,
            constructor = this.constructor;

        // 使所有组件能将组件的data数据转变为json对象
        if (typeof constructor.prototype.data !== 'function') {
            constructor.prototype.data = function () {
                var data = this.$.data(name);

                // data首尾空格与尾部逗号
                data = $.trim(data).replace(/\,$/gm, '');

                // 转变为json格式
                data = '{"' + data.replace(/(:|\,)/gm, '"$1"') + '"}';

                // 将逻辑字符串"true"与数值字符串"123"等转变为对应的值类型
                data = data.replace(/\"((\d+\.?\d*)|(true)|(false)\")/gm, '$1');

            };
        }

        $elements = $initElements ? $initElements : $(this.selector);

        $elements.each(function () {
            var $this = $(this),
                component = $this.data('twui.'+name);

            if (!component) {
                component = new constructor($this);

                if (typeof component.init == 'function') {
                    component.init();
                }
                
                $this.data('twui.' + name, component);
            }
        });
    };
    
    // twui组件容器
    twui.modules = {};

    // 注册twui组件
    twui.module = function (constructor) {
        var module = null;

        module = new twui(constructor);

        // 检测是否已经存在该组件
        if (this.modules[module.name] != undefined) {
            throw Error(module.name + '组件已经存在，请检查是否与现有组件重名!');
        }

        this.modules[module.name] = module;
    };

    // 通过选择器获取组件名称
    twui.getModuleName = function (selector) {
        var moduleName = '';

        if (typeof selector == 'string') {
            moduleName = selector.substring(5);
        }

        if (this.modules[moduleName] instanceof this) {
            return moduleName;
        }
    };

    // 初始化所有组件
    twui.init = function () {
        var modules = this.modules;

        for (var propName in modules) {
            modules[propName].build();
        }
    };

    // 页面加载时初始化所有组件
    $(document).ready(function () {
        twui.init();
    });
}(jQuery);
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:twui基础模块
 * ------------------------------------------------------------ */
+function ($) {
    // 注册jQuery事件:lazyScroll(减少滚动时滚动事件重复触发次数)
    $.event.special.lazyScroll = {
        setup: function (data) {
            var timer = 0;

            $(this).on('scroll.lazyScroll', function (event) {
                if (!timer) {
                    timer = setTimeout(function () {
                        $(this).triggerHandler('lazyScroll');
                        timer = 0;
                    }, 150);
                }
            });
        },
        teardown: function () {
            $(this).off('scroll.lazyScroll');
        }
    };

    // 注册jQuery事件:lazyResize(减少窗口大小变化时resize事件重复触发次数)
    $.event.special.lazyResize = {
        setup: function (data) {
            var timer = 0;

            $(this).on('resize.lazyResize', function (event) {
                if (!timer) {
                    timer = setTimeout(function () {
                        $(this).triggerHandler('lazyResize');
                        timer = 0;
                    }, 200);
                }
            });
        },
        teardown: function () {
            $(this).off('resize.lazyResize');
        }
    };

    // 来源于bootstrap的transitionend事件定义
    function transitionEnd() {
        var el = document.createElement('twui')

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return { end: transEndEventNames[name] }
            }
        }

        return false // explicit for ie8 (  ._.)
    }

    // 手动触发过渡效果,此jquery实例方法修改自bootstrap的emulateTransitionEnd方法
    $.fn.doGoend = function () {
        var called = false;
        var $el = this;
        var duration = parseFloat($(this).css('transition-duration').split(','));

        duration = isNaN(duration) ? 0 : duration * 1000;

        $(this).one('goend', function () {
            called = true;
        })

        var callback = function () {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        }

        setTimeout(callback, duration);
        return this;
    };

    // 定义goend事件：也即transitionend事件的twui版
    $(function () {
        $.support.transition = transitionEnd()

        if (!$.support.transition) return

        $.event.special.goend = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) return
                e.handleObj.handler.apply(this, arguments)
            }
        }
    });

    // 注册jQuery实例方法:获取jquery对象class属性中与twui模块相关的模块名称
    $.fn.getTwuiNames = function () {
        var moduleSelectorRegex = /\bjst-[^\s"]+/g,
            classString = this.attr('class'),
            matches = '',
            moduleName='',
            moduleNames = [];

        // 获取所有的以jst-开头的class类名
        do {
            matches = moduleSelectorRegex.exec(classString);
            if (matches == null) {
                break;
            }

            moduleName = matches[0].substring(4);

            if(twui.modules[moduleName] instanceof twui){
                moduleNames.push(moduleName);
            }
        } while (true)

        return moduleNames;
    };

    // 注册jQuery实例方法:获取对应的twui模块实例
    $.fn.getTwuiModules = function () {
        var moduleNames = this.getTwuiNames(),
            modules = [];

        // 初始化相关的模块
        for (var i = 0; i < moduleNames.length; i++) {
            modules.push(twui.modules[moduleNames[i]]);
        }

        return modules;
    };

    /* ------------------------------------------------------------------------------------------------------------------------
     * 注册jQuery实例方法twui，参数说明：
     * 1.methodName:可选，要调用的方法名,不指定或指定的方法在组件上不存在，会将方法自动赋值为init初始化方法。
     * 2.moduleSelector:模块选择器，可选，当该元素绑定了多个twui组件对象时且对象存在同名方法时，必须指定。
     * 3.如果该元素还未构造成twui组件，将在其上自动运行twui.build()方法使其转变为twui组件。
     * 4.如果第二个参数不是模块选择器，则第二个参数后的所有参数，都会传递给调用的方法。
     * ------------------------------------------------------------------------------------------------------------------------ */
    $.fn.twui = function (methodName, moduleSelector) {
        var args = [],
            i=1,
            optionName = twui.getModuleName(moduleSelector);

        if (typeof optionName == 'string') i = 2;

        for (; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return this.each(function () {
            var $this = $(this),
                tagName = $(this).tagName,
                moduleNames = $this.getTwuiNames(),
                moduleName = name = '',
                conflict = -1,
                component = null;

            // 指定默认方法名
            if (!typeof methodName == 'string') {
                methodName = 'init';
            }

            // 构建twui组件及检测方法是否有冲突
            for (var i = 0; i < moduleNames.length; i++) {
                name = moduleNames[i];

                component = $this.data('twui.' + name);

                if (!component) {
                    twui.modules[name].build($this);
                    component = $this.data('twui.' + name);
                }

                if (methodName != 'init' && component[methodName]) {
                    moduleName = name;
                    conflict++;
                }
            }

            // 方法冲突处理
            if (conflict > 0) {
                if (typeof optionName != 'string') {
                    if (console.error) {
                        console.error(this, '\n以上元素绑定了多个twui组件且组件存在同名方法，调用方法时必须指定模块选择器".jst-moduleName"!');
                    }
                    throw Error('元素【' + $this[0].tagName + '.' + $this.attr('class').replace(/\s+/g, '.') + '】绑定了多个twui组件且组件存在同名方法，调用方法时必须指定模块选择器".jst-moduleName"!');
                } else {
                    moduleName = optionName;
                }
            }

            component = $this.data('twui.' + moduleName);

            if (component && component[methodName]) {
                component[methodName].apply(component, args);
            }
        });
    };
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:默认配置项
 * ------------------------------------------------------------ */
+function ($) {
    twui.config = {
        win: {
            content: '',
            miniTime: 3000
        },
        wins: {
            confirm: {
                title: '确认提示',
                icon: '<i class="ico ico-confirm"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">确定</a>'
                    },
                    {
                        html: '<a class="u-btn xlesser">取消</a>'
                    }
                ]
            },
            success: {
                icon: '<i class="ico ico-success"></i>',
                time:2000
            },
            alert: {
                title: '警告提示',
                icon: '<i class="ico ico-warning"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">确定</a>'
                    },
                    {
                        html: '<a class="u-btn xlesser">关闭</a>'
                    }
                ]
            },
            error: {
                title: '错误提示',
                icon: '<i class="ico ico-error"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">知道了</a>'
                    }
                ]
            },
            tip: {
                title: '提示信息',
                icon: '<i class="ico ico-tip"></i>',
                btns: [
                    {
                        html: '<a class="u-btn xprimary">知道了</a>'
                    }
                ]
            },
            loading: {
                icon: '<i class="ico ico-loading"></i>',
                time:0
            },
            msg: {
                time: 2000
            }
        }
    };
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:html模板
 * ------------------------------------------------------------ */
+function ($) {
    twui.templete = {
        editInput: '<input class="c-editinput" type="text" />',
        win: '<div class="m-win info jst-win"><div class="win-body"><div></div></div></div>',
        winHeader: '<div class="win-header"><a class="shut js-win-close" title="关闭">×</a><h4></h4></div>',
        winMax:'<a class="max js-win-max" title="最大化"></a>',
        winFooter:'<div class="win-footer"></div>',
        msgWin: '<div class="m-win msg jst-win"><i></i><div></div></div>',
        editItem: '<li class="jst-edititem"><a><span class="js-value"></span><div class="sidebar-edititems-icons"><span class="js-editbtn"><i class="ico ico-edit2"></i></span><span class="js-delbtn"><i class="ico ico-delete2"></i></span></div></a></li>',
        tabMore: '<div class="tabnav-more js-more"><span>更多<b class="caret"></b></span><div></div></div>',
        dim: '<div class="c-dim"></div>'
    };
}(jQuery);
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:twui公用函数
 * ------------------------------------------------------------ */
+function ($) {
    // 获取元素的三维矩阵信息
    twui.getElementMatrix = function ($element) {
        var top = $element.offset().top,
            left = $element.offset().left,
            width = $element.outerWidth(),
            height = $element.outerHeight();

        return { top: top, left: left, width: width, height: height };
    };

    // 复制元素的矩阵信息
    twui.copyMatrix = function ($source) {
        var matrix = twui.getElementMatrix($source);

        for (var i = 1; i < arguments.length; i++) {
            arguments[i].css({
                left: matrix.left,
                top: matrix.top,
                width: matrix.width,
                height: matrix.height
            });
        }
    };

    // 居中元素
    twui.center = function ($source, $element, nonnegative) {
        var sourceWidth = $source.outerWidth(),
            sourceHeight = $source.outerHeight(),
            elementWidth = $element.outerWidth(),
            elementHeight = $element.outerHeight(),
            x = (sourceWidth - elementWidth) / 2,
            y = (sourceHeight - elementHeight) / 2;

        if (nonnegative) {
            x = x < 0 ? 0 : x;
            y = y < 0 ? 0 : y;
        }

        $element.css({ left: x, top: y });
    };
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:类处理器
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:ClassHandler组件类
    // ------------------------------
    var ClassHandler = function ($element) {
        this.$ = $element;
    };

    // 定义:ClassHandler组件的类选择器
    // ------------------------------
    ClassHandler.prototype.selector = '.jst-classhandler';

    // 方法:twui调用的入口方法
    // ------------------------------------------------------------
    ClassHandler.prototype.init = function () {

    };

    // 方法：根据浏览器的url来处理类
    // ------------------------------------------------------------
    ClassHandler.prototype.handleUrl = function () {

    };

    // 注册成twui模块
    // ------------------------------
    twui.module(ClassHandler);
}(jQuery);
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:url激活导航
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Conponent组件类
    // ------------------------------
    var Conponent = function ($element) {
        this.$ = $element;
    };

    // 定义:Conponent组件的类选择器
    // ------------------------------
    Conponent.prototype.selector = '.jst-conponent';

    // 方法:twui调用的入口方法
    // ------------------------------------------------------------
    Conponent.prototype.init = function () {

    };

    // 注册成twui模块
    // ------------------------------
    twui.module(Conponent);
}(jQuery);
/* ------------------------------------------------------------
 * 版本:{{version}}
 * 描述:sidenav组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:sidenav组件类
    // ------------------------------
    var SideNav = function ($element) {
        this.$ = $element;
    };

    // 定义:sidenav组件的类选择器
    // ------------------------------
    SideNav.prototype.selector = '.jst-sidenav';

    // 方法:显示或隐藏子导航
    // ------------------------------
    SideNav.prototype.toggle = function ($subNavBtn) {
        var me = this.$,
            $parent = $subNavBtn.parent(),
            $subNav = $parent.find('> ul');
        
        var toggleEvent = $.Event('toggle');

        me.trigger(toggleEvent, [$parent]);
        if (toggleEvent.isDefaultPrevented()) return;

        $subNav.one('goend', function () {
            $parent.toggleClass('active');
            $subNav.css('height', '');
        }).doGoend();

        var $active = $parent.parent().find(' > .active'),
            $activeSubNav = $active.find('> ul');

        if ($parent.hasClass('active')) {
            $subNav.height($subNav.height()).height(0);
        } else {
            $activeSubNav.height($activeSubNav.height()).height(0);
            $active.removeClass('active');
            $subNav.height($subNav[0].scrollHeight);
        }
    };

    // 事件：点击节点时调用激活节点方法
    // ------------------------------
    $(document).on('click.twui.sidenav', '.jst-sidenav .js-subnav-btn', function () {
        var $this = $(this),
            $sidenav = $this.closest('.jst-sidenav');

        $sidenav.twui('toggle', '.jst-sidenav', $this);
    });

    // 注册成twui模块
    // ------------------------------
    twui.module(SideNav);
}(jQuery);

/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:URL导航-根据URL选择当前的活动导航
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:URLNav组件类
    // ------------------------------
    var URLNav = function ($element) {
        this.$ = $element;
    };

    // 定义:URLNav组件的类选择器
    // ------------------------------
    URLNav.prototype.selector = '.jst-urlnav';

    // 方法:根据URL选择当前的活动导航
    // ------------------------------
    URLNav.prototype.activate = function () {
        var me = this.$,
            selector = me.data('selector'),
            back = parseInt(me.data('back')),
            url = window.location.href,
            links = me.find('a'),
            $target=$(),
            matching = -1;

        if (selector) selector = 'li';

        back = isNaN(back) ? 0 : back;

        links.each(function () {
            var $this = $(this),
                weight=0,
                urlKeyword = $this.data('urlKeyword');

            if (typeof urlKeyword !== 'string') {
                urlKeyword = this.href;

                for (var i = 0; i < back; i++) {
                    urlKeyword = urlKeyword.substring(0, urlKeyword.lastIndexOf('/') + 1);
                }
            } else {
                weight = 10000;
            }

            // 匹配度高的优先
            if (url.indexOf(urlKeyword) != -1) {
                if (urlKeyword.length + weight > matching) {
                    matching = urlKeyword.length + weight;
                    $target = $this;
                }
            }
        });

        $target.parentsUntil('.jst-urlnav', selector).addClass('active').siblings().removeClass('active');
    };

    // 注册成twui模块
    // ------------------------------
    twui.module(URLNav);
}(jQuery);