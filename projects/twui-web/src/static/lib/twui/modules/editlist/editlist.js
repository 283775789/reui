/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:editlist组件
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:EditList组件类
    // ------------------------------
    var EditList = function ($element) {
        this.$ = $element;
    };

    // 定义:EditList组件的类选择器
    // ------------------------------
    EditList.prototype.selector = '.jsx-editlist';

    // 方法:twui调用的入口方法
    // ------------------------------
    EditList.prototype.init = function () {
        var me = this,
            $addBtn = me.$.find('.js-addbtn');

        $addBtn.on('click.twui.editlist', function () {
            me.addItem(this);
        });
    };

    // 方法:添加可编辑项
    // ------------------------------
    EditList.prototype.addItem = function (element) {
        var $editList=this.$,
            $addBtn = $(element),
            $parent = $addBtn.parent(),
            $editItem = $(twui.templete.editItem),
            $editBtn = $editItem.find('.js-editbtn'),
            addEvent = null;

        $editItem.one('change.twui', function (event) {
            addEvent = $.Event('add.twui', { element: this, value: event.value });
            $editList.trigger(addEvent);

            if (addEvent.isDefaultPrevented()) {
                event.preventDefault();
                $(this).remove();
            }

            $editItem.off('nochange.twui');
        });

        $editItem.one('nochange.twui', function () {
            $(this).remove();
        });

        $editItem.insertBefore($parent).twui('init');
        $editBtn.trigger('click.twui.edititem');
    };

    // 注册成twui模块
    // ------------------------------
    twui.module(EditList);
}(jQuery);