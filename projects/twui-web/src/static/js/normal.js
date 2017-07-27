/* ------------------------------------------------------------
 * 描述:普通的脚本
 * ------------------------------------------------------------ */

// 方法:markdown生成html内容
// ------------------------------
+function ($) {
    var designPath = '/static/lib/twui/design/';
    
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

            // 生成设计文件下载链接
            var $designLink = $markdown.find('h2 > a');
            $designLink.text('').attr({
                'href': designPath + $designLink.attr('href'),
                'title':'下载设计源文件'
            });
                $designLink.addClass('twui-ifont xdownload');

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
                    $codeHeader = $('<div class="twui-markdown-codeheader"><span class="twui-shortcut"><i class="twui-ifont xshortcut" title="快捷输入"></i><code>' + ext + '@' + filename + '</code></span><a class="twui-ifont xcopy" title="复制代码"></a></div>');

                $code.parent().before($codeHeader);
                new Clipboard($codeHeader.find('a')[0], {
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