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
