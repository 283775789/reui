/* ------------------------------------------------------------
 * 版本:{{version}}
 * 描述:treenav组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:Tree组件类
    // ------------------------------
    var Tree = function ($element) {
        this.$ = $element;
    };

    // 定义:tree组件的类选择器
    // ------------------------------
    Tree.prototype.selector = '.jst-tree';

    // 方法:激活节点
    // ------------------------------
    Tree.prototype.activate = function ($node) {
        var me = this.$,
            $target = $node.closest('li'),
            showEvent = $.Event('show');

        // 触发show事件
        me.trigger(showEvent, { $target: $target });
        if (showEvent.isDefaultPrevented()) return;

        var $parentUl= $node.closest('ul'),
            $active = $parentUl.find('> .active'),
            $activeUl=$active.find('> ul'),
            $branch = $target.find('> ul'),
            startHeight = 0,
            endHeight = 0;

        if ($parentUl.hasClass('twui-tree-branch')) $parentUl.css('height', '');

        $activeUl.height($activeUl.height());

        if ($node.attr('href')) {
            if ($target.hasClass('active')) return;
            $target.addClass('active');
        } else {
            $target.toggleClass('active');
        }

        $active.removeClass('active').find('ul').css('height', '');

        $branch.css('height', '');
        endHeight = $target.hasClass('active') ? $branch.height() : 0;
        $branch.height(startHeight).height(endHeight);
    };

    // 事件：点击节点时调用激活节点方法
    // ------------------------------
    $(document).on('click.twui.tree', '.jst-tree a', function () {
        var $this = $(this),
            $tree = $this.closest('.jst-tree');

        $tree.twui('activate', '.jst-tree', $this);
    });

    // 注册成twui模块
    // ------------------------------
    twui.module(Tree);
}(jQuery);
