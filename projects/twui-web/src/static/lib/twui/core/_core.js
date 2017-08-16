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