/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:sidebar
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Collapse组件类
    // ------------------------------
    var Collapse = function ($element) {
        this.$ = $element;
    };

    // 定义:Collapse组件的类选择器
    // ------------------------------
    Collapse.prototype.selector = '.jsx-collapse';

    // 方法:切换折叠项的显示与隐藏
    // ------------------------------
    Collapse.prototype.toggle = function () {
        var $me = this.$,
            $target = $($me.data('target')),
            speed = this.speed(),
            showEvent = $.Event('show.twui.collapse'),
            shownEvent = $.Event('shown.twui.collapse'),
            hideEvent = $.Event('hide.twui.collapse'),
            hiddenEvent = $.Event('hidden.twui.collapse');

        if ($target.is(':visible')) {
            $me.trigger(hideEvent);

            if (hideEvent.isDefaultPrevented()) return;

            $target.stop(true, true).slideUp(speed, function () {
                $(this).addClass('collapse');
                $me.addClass('collapsed');
                $me.trigger(hiddenEvent);
            });
        } else {
            $me.trigger(showEvent);

            if (showEvent.isDefaultPrevented()) return;

            $target.stop(true, true).slideDown(speed, function () {
                $(this).removeClass('collapse');
                $me.removeClass('collapsed');
                $me.trigger(shownEvent);
            });
        }
    };

    // 方法:在document上委托click事件
    // ------------------------------
    $(document).on('click.twui.collapse', '.jsx-collapse', function () {
        $(this).twui('toggle', '.jsx-collapse');
    });

    // 注册成twui模块
    // ------------------------------
    twui.module(Collapse);
}(jQuery);
