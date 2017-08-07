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
            pathIndent = parseInt(me.data('pathIndent')),
            url=window.location.href,
            links = me.find('a');

        if (selector) selector = 'li';

        pathIndent = isNaN(pathIndent) ? 0 : pathIndent;

        links.each(function () {
            var $this = $(this),
                urlKeyword = $this.data('urlKeyword');

            if (typeof urlKeyword !== 'string') {
                urlKeyword = this.href;

                for (var i = 0; i < pathIndent; i++) {
                    urlKeyword = urlKeyword.substring(0, urlKeyword.lastIndexOf('/') + 1);
                }
            }

            if (url.indexOf(urlKeyword) != -1) {
                $this.parentsUntil('.jst-urlnav', selector).addClass('active').siblings().removeClass('active');
                return false;
            }
        });
    };

    // 注册成twui模块
    // ------------------------------
    twui.module(URLNav);
}(jQuery);