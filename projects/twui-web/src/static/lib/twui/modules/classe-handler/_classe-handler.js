/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:类处理器
 * ------------------------------------------------------------ */
+function ($) {
    // 定义:ClassHandler组件类
    // ------------------------------
    var ClassHandler = function ($element) {
        this.$ = $element;
    };

    // 定义:ClassHandler组件的类选择器
    // ------------------------------
    ClassHandler.prototype.selector = '.jst-classhandler';

    // 方法:twui调用的入口方法
    // ------------------------------------------------------------
    ClassHandler.prototype.init = function () {

    };

    // 方法：根据浏览器的url来处理类
    // ------------------------------------------------------------
    ClassHandler.prototype.handleUrl = function () {

    };

    // 注册成twui模块
    // ------------------------------
    twui.module(ClassHandler);
}(jQuery);