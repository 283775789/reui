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
            throw Error('选择器无效，请以".jst-"开头，然后输入模块名字（需符合js变量规则）!');
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
    
    // twui模块容器
    twui.modules = {};

    // 注册twui模块
    twui.module = function (constructor) {
        var module = null;

        // 为所有组件添加animate方法
        constructor.prototype.animate = function () {
            return twui.config.animate && this.$.data('animate') != false;
        };

        // 为所有组件添加speed方法
        constructor.prototype.speed = function () {
            var speed = twui.config.speed;

            if (!this.animate()) speed = 0;

            return speed;
        };

        module = new twui(constructor);

        this.modules[module.name] = module;
    };

    // 通过选择器获取模块名称
    twui.getModuleName = function (selector) {
        var moduleName = '';

        if (typeof selector == 'string') {
            moduleName = selector.substring(5);
        }

        if (this.modules[moduleName] instanceof this) {
            return moduleName;
        }
    };

    // 初始化所有模块
    twui.init = function () {
        var modules = this.modules;

        for (var propName in modules) {
            modules[propName].build();
        }
    };

    // 页面加载时初始化所有模块
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
        animate: true,
        speed: 300,
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
 * 描述:导航(nav)
 * ------------------------------------------------------------ */
/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:sidebar组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Sidebar组件类
    // ------------------------------
    var Sidebar = function ($element) {
        this.$ = $element;
    };

    // 定义:sidebar组件的类选择器
    // ------------------------------
    Sidebar.prototype.selector = '.jst-sidebar';


    // 方法:twui调用的入口方法
    // ------------------------------
    Sidebar.prototype.init = function () {
        var me = this,
            $link = me.$.find('a');

        $link.on('click.twui.slidebar', function () {
            me.showMenu(this);
        });
    };

    // 方法:显示选中的菜单
    // ------------------------------
    Sidebar.prototype.showMenu = function (element) {
        var me = this,
            $element = $(element),
            $ul = $element.closest('ul'),
            $subUl = $element.parent().children('ul,.sidebar-scroll'),
            $active = $ul.find('> .active'),
            $activeSubUl = $active.children('ul,.sidebar-scroll'),
            speed = me.speed();

        if ($subUl.length > 0) {
            $subUl.stop(true).slideToggle(speed, function () {
                me.activate($element, $subUl, $activeSubUl);
            });

            if (!$subUl.is($activeSubUl)) {
                $activeSubUl.stop(true).slideUp(speed);
            }
        } else {
            if ($activeSubUl.length > 0) {
                $activeSubUl.stop(true).slideUp(speed, function () {
                    me.activate($element, $subUl, $activeSubUl);
                });
            } else {
                me.activate($element, $subUl, $activeSubUl);
            }
        }
    };

    // 方法:为点击的菜单所在的li元素添加active
    // ------------------------------
    Sidebar.prototype.activate = function ($link, $showElement, $hideElement) {
        $link.parent().toggleClass('active').siblings().removeClass('active');
        $showElement.css('display', '');
        $hideElement.css('display', '');
    };

    // 注册成twui模块
    // ------------------------------
    twui.module(Sidebar);
}(jQuery);

/* ------------------------------------------------------------
 * �汾:1.0
 * ����:�������
 * ------------------------------------------------------------ */
/* ------------------------------------------------------------
 * �汾:1.0
 * ����:�������
 * ------------------------------------------------------------ */
/* ------------------------------------------------------------
 * �汾:1.0
 * ����:�������
 * ------------------------------------------------------------ */
/* ------------------------------------------------------------
 * �汾:1.0
 * ����:�������
 * ------------------------------------------------------------ */