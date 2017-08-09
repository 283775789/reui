/* ------------------------------------------------------------
 * 描述:普通的脚本
 * ------------------------------------------------------------ */
var webui = {
    // 本地数据集存贮页面状态
    dataset: window.sessionStorage ? window.sessionStorage : {},
    // 获取据集中的数据,key为资源文件路径
    data: function (key, contentType, callback) {
        if (typeof webui.dataset[key] === 'string') {
            webui.dataset[key];
            callback(webui.dataset[key]);
        } else {
            if (contentType === 'sidebar') {
                $.post(key, { type: 'ajx' }, function (data) {
                    webui.dataset[key] = data;
                    callback(data);
                });
            } else {
                $.post(key, { type: 'ajx' }, function (data) {
                    webui.codeMarkdown(data, key, callback);
                });
            }
        }
    },
    // 记录上次的路径
    lastPathname: undefined,
    // 加载内容,pathname为资源文件路径
    loadContent: function (pathname, source) {
        var $sidebarBox = $('#sidebar-box');

        // 避免多次单击同一链接
        if (pathname === webui.lastPathname) {
            return;
        } else {
            webui.lastPathname = pathname;
        }

        // 获取侧边栏html
        if (pathname != '/') {
            var matching = /^\/\w*\/\w*\//.exec(pathname);

            if (matching === null) return;

            var sidebarKey = matching[0];

            if (! /^\/web/.test(sidebarKey)) {
                sidebarKey = '/web/modules/'
            }
        } else {
            sidebarKey = pathname;
        }

        if (source != 'sidebar') {
            // 生成侧边栏
            webui.data(sidebarKey+'nav.html', 'sidebar', function (data) {
                $sidebarBox.html(data);
                $sidebarBox.addClass('jst-urlnav').twui('activate');
            });
        }

        // 生成主内容
        webui.data(pathname+'.md', 'content', function (data) {
            $('#markdown').html(data);
            webui.highlight();
            new Clipboard('.js-copybtn', {
                text: function (src) {
                    return $(src).parent().next().text();
                }
            });
        });

        // 生成历史记录
        if (source != 'history') {
            if (source === 'get') {
                history.replaceState({ uid: pathname }, pathname, pathname);
            } else {
                history.pushState({ uid: pathname }, pathname, pathname);
            }
        }

        $('#nav').twui('activate');
        $sidebarBox.addClass('jst-urlnav').twui('activate');
    },
    // 初始化导航
    initNav: function () {
        // 绑定侧边栏事件
        $(document).off('click.webui.nav').on('click.webui.nav', '#nav a', function (event) {
            var $this = $(this),
                href = $this.attr('href');

            event.preventDefault();

            webui.loadContent(href,'nav');
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
    //  编译markdown文件
    codeMarkdown: function (data, key, callback) {
        var $markdown = $('<div></div>'),
            contentHtml = marked(data);

        $markdown.html(contentHtml);

        // 生成设计文件下载链接
        var $designLink = $markdown.find('h2 > a');
        $designLink.text('').attr({
            'href': webui.designPath + $designLink.attr('href'),
            'title': '下载设计源文件',
            target: '_blank'
        });
        $designLink.addClass('twui-ifont xdownload');

        // 获取所有的demo与code的路径
        var $demos = $markdown.find('blockquote');
        var $codes = $markdown.find('pre code');
        var files = $demos.length + $codes.length;

        // 没有demo与code处理
        if (files === 0) {
            webui.dataset[key] = contentHtml;
            callback(contentHtml);
            return;
        }

        // 当最后一个demo或code文件已经加载时才运行回调
        var rendererMarkdown = function () {
            contentHtml = $markdown.html();
            webui.dataset[key] = contentHtml;
            callback(contentHtml);
        };

        // 生成demo
        $demos.each(function () {
            var $demo = $(this);
            var demoUrl = $demo.find('a').attr('href');
            var $demoBox = $('<div class="twui-demobox"></div>');

            $demo.before($demoBox).remove();

            $.post(demoUrl, function (data) {
                $demoBox.html(data);
                rendererMarkdown();
            });
        });

        // 生成code
        $codes.each(function () {
            var $code = $(this),
                codeUrl = $(this).text().replace(/\{|\}/g, ''),
                filename = codeUrl.substring(codeUrl.lastIndexOf('/') + 1, codeUrl.lastIndexOf('.')).replace('_', ''),
                ext = $.trim(codeUrl.substring(codeUrl.lastIndexOf('.') + 1)),
                $codeHeader = $('<div class="twui-markdown-codeheader"><span class="twui-shortcut" title="快捷输入"><i class="twui-ifont xshortcut"></i><span>' + ext + '@' + filename + '</span></span><a class="twui-ifont xcopy js-copybtn" title="复制代码"></a></div>');

            $code.parent().before($codeHeader);

            $.post(codeUrl, function (data) {
                data = data.replace(/^\r\n/, '');
                $code.text(data);
                rendererMarkdown();
            })
        });
    },
    // 初始化侧边栏
    initSidebar: function () {
        $(document).off('click.webui.sidebar').on('click.webui.sidebar', '#sidebar a', function (event) {
            var $this = $(this),
                href = $this.attr('href');

            event.preventDefault();
            webui.loadContent(href, 'sidebar');
        });
    },
    // 初始化页面
    initPage: function () {
        var pathname = location.pathname;

        webui.loadContent(pathname,'get')
    },
    // 全部初始化
    init: function () {
        webui.initPage();
        webui.initNav();
        webui.initSidebar();

        // 绑定history事件
        $(window).off('popstate.webui').on('popstate.webui', function () {
            if (history.state != null) {
                var pathname = history.state.uid;
                webui.loadContent(pathname, 'history');
            }
        });
    }
}

// 初始化项目相关的ui脚本
$(document).ready(function () {
    webui.init();
});