/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:Anchor
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Anchor组件类
    // ------------------------------
    var Anchor = function ($element) {
        this.$ = $element;
    };

    // 定义:Anchor组件的类选择器
    // ------------------------------
    Anchor.prototype.selector = '.jsx-anchor';

    // 方法:twui调用的入口方法
    // ------------------------------
    Anchor.prototype.init = function () {
        var me = this;
        var $me = this.$;
        var $anchors = $me.find('a');

        // 点击锚点调用滑动方法
        $anchors.on('click.twui.anchor', function () {
            me.slide($(this));
        });

        // 滚动监视
        var $dataLink = $($me.data('link'));
        $dataLink = $dataLink.length > 0 ? $dataLink : $(window);

        $dataLink.on('scroll.twui.anchor', function () {
            me.scrollSpy($(this));
        });
    };

    // 方法:滑动方法
    // ------------------------------
    Anchor.prototype.slide = function ($this) {
        var $me = this.$;
        var $dataLink = $($me.data('link'));
        var $activeAnchor = $me.find('a.active');

        if ($activeAnchor.is($this)) return;

        var slideEvent = $.Event('slide.twui.scrollspy');
        var slidEvent = $.Event('slid.twui.scrollspy');

        $me.trigger(slideEvent);
        if (slideEvent.isDefaultPrevented()) return;

        var $target = $($this.data('target'));
        var targetTop = $target.offset().top;
        var offset = $me.data('offset');
        var speed = this.speed();

        if ($dataLink.length == 0) {
            $dataLink = $('html,body');
        } else {
            var linkScrollTop = $dataLink.scrollTop();
            targetTop = targetTop - $dataLink.offset().top + linkScrollTop;
        }

        if (typeof offset == 'number') targetTop -= offset;

        $dataLink.animate({ scrollTop: targetTop }, speed, function () {
            $activeAnchor.removeClass('active');
            $this.addClass('active');
            $me.trigger(slidEvent);
        });
    };

    // 方法:滑动方法
    // ------------------------------
    Anchor.prototype.scrollSpy = function ($this) {
        var scrollTop = $this.scrollTop();
        var top = 0;

        if (!$this.is($(window))) top = scrollTop - $this.offset().top;

        var $me = this.$;
        var $anchors = $me.find('a');
        var offset = $me.data('offset');

        offset = isNaN(offset) ? 0 : offset;

        $anchors.each(function () {
            var $self = $(this);
            var $target = $($self.data('target'));
            var targetTop = $target.offset().top;

            if (scrollTop >= (targetTop + top - offset)) {
                $me.find('a.active').removeClass('active');
                $self.addClass('active');
            }
        });
    };

    // 注册成twui模块
    // ------------------------------
    twui.module(Anchor);
}(jQuery);