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
