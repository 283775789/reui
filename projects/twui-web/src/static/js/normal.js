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
                    codeUrl = $(this).text().replace(/\{|\}/g, ''),
                    filename = codeUrl.substring(codeUrl.lastIndexOf('/') + 1, codeUrl.lastIndexOf('.')).replace('_', ''),
                    ext = $.trim(codeUrl.substring(codeUrl.lastIndexOf('.') + 1)),
                    $copy = $('<div class="twui-markdown-copybox"><span class="twui-shortcut"><i class="twui-ifont xshortcut" title="快捷输入"></i>' + ext + '@' + filename + '</span><a class="twui-ifont xcopy" title="复制代码"></a></div>');

                $code.parent().before($copy);
                new Clipboard($copy.find('a')[0], {
                    text: function () {
                        return $code.text();
                    }
                });

                $.get(codeUrl, function (data) {
                    data=data.replace(/^\r\n/, '');
                    $code.text(data);
                    highlight();
                });
            });
        });
    });
}(jQuery);