/* ------------------------------------------------------------
 * 描述:普通的脚本
 * ------------------------------------------------------------ */

// 方法:markdown生成html内容
// ------------------------------
+function ($) {
    // 代码高亮
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

        // 编译markdown文件
        $.get(href, function (data) {
            var $markdown = $('#markdown');

            $markdown.html(marked(data));

            // 生成demo
            var $demos = $markdown.find('blockquote');
            $demos.each(function () {
                var $demo=$(this);
                var demoUrl = $demo.find('a').attr('href');
                var $demoBox = $('<div class="twui-demobox"></div>');

                $demo.before($demoBox).remove();
                $demoBox.load(demoUrl);
            });

            // 生成code
            var $codes = $markdown.find('pre code');
            $codes.each(function () {
                var $code = $(this),
                    codeUrl = $(this).text().replace(/\{|\}/g, '');

                $.get(codeUrl, function (data) {
                    data=data.replace(/^\r\n/, '');
                    $code.text(data);
                    highlight();
                });
            });
        });
    });
}(jQuery);