/* ------------------------------------------------------------
 * 描述:普通的脚本
 * ------------------------------------------------------------ */

// 方法:markdown生成html内容
// ------------------------------
+function ($) {
    function highlight() {
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    };

    $('#sidebar').off('click.sidebar').on('click.sidebar', 'a', function (event) {
        var $this = $(this),
            href = $this.attr('href');

        event.preventDefault();
        if (!href) return;

        $.get(href, function (data) {
            $('#markdown').html(marked(data));
            highlight();            
        });
    });
}(jQuery);