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