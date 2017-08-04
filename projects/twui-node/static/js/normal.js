/* ------------------------------------------------------------
 * 描述:普通的脚本
 * ------------------------------------------------------------ */
var webui = {
    // 本地存贮
    pocket: window.sessionStorage ? window.sessionStorage : {},
    // 加载侧边栏内容
    loadSidebar: function (href, isFirstPage, fromHistory) {
        var $sidebarBox = $('#sidebar-box'),
            uid = href;

        if (href === '/') {
            href = '/web/design/';
        }

        if (typeof webui.pocket[href] === 'string') {
            $sidebarBox.html(webui.pocket[href]);
        } else {
            $sidebarBox.load(href + '/nav.html', function (data) {
                webui.pocket[href] = data;
            });
        }

        if (!fromHistory) {
            if (isFirstPage) {
                history.replaceState({ uid: uid }, href, uid);
            } else {
                history.pushState({ uid: uid }, href, uid);
            }
        }
    },
    // 初始化侧边栏
    initSidebar: function () {
        // 绑定侧边栏事件
        $(document).off('click.nav').on('click.nav', '#nav a', function (event) {
            var $this = $(this),
                href = $this.attr('href');

            event.preventDefault();

            webui.loadSidebar(href);
        });
    },
    // 设计文件保存路径
    designPath: '/static/lib/twui/design/',
    // 代码高亮
    highlight: function () {
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    },
    // 初始化第一页
    initFirstPage: function () {
        var url = location.pathname;
        webui.loadSidebar(url, true);
    },
    // 全部初始化
    init: function () {
        webui.initSidebar();

        // 绑定history事件
        $(window).off('popstate.webui').on('popstate.webui', function () {
            if (history.state != null) {
                var type = history.state.type;
                var uid = history.state.uid;
                webui.loadSidebar(uid, false, true);
            }
        });

        // 初始化第一页
        webui.initFirstPage();
    }
}

// 初始化项目相关的ui脚本
$(document).ready(function () {
    webui.init();
});

// 方法:markdown生成html内容
// ------------------------------
+function ($) {
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
                'title': '下载设计源文件',
                target: '_blank'
            });
            $designLink.addClass('twui-ifont xdownload');

            // 生成demo
            var $demos = $markdown.find('blockquote');
            $demos.each(function () {
                var $demo = $(this);
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
                    $codeHeader = $('<div class="twui-markdown-codeheader"><span class="twui-shortcut" title="快捷输入"><i class="twui-ifont xshortcut"></i><code>' + ext + '@' + filename + '</code></span><a class="twui-ifont xcopy" title="复制代码"></a></div>');

                $code.parent().before($codeHeader);
                new Clipboard($codeHeader.find('a')[0], {
                    text: function () {
                        return $code.text();
                    }
                });

                $.get(codeUrl, function (data) {
                    data = data.replace(/^\r\n/, '');
                    $code.text(data);
                    highlight();
                });
            });
        });
    });
}(jQuery);