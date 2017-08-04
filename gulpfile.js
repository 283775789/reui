/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:gulp任务
 * ------------------------------------------------------------ */
// 获取项目所在的路径
// ------------------------------
var fullPath = process.argv.slice(2)[0].replace(/["\\]/g, '/');
var isMobile = fullPath.indexOf('-1') == 0;
var gulpPath = fullPath.substring(fullPath.lastIndexOf('projects'));
var src = gulpPath + 'src/';
// var dest = gulpPath + 'dist/';
var dest = 'D:/ab-twui/projects/twui-node/';

// 引用插件
// ------------------------------
var gulp = require('gulp');
var include = require('gulp-file-include');
var replace = require('gulp-replace');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sprite = require('gulp.spritesmith');
var server = require('browser-sync');
var reload = server.reload;
var concat = require('gulp-concat');
var del = require('del');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('gulp-cssnano');
var fs = require('fs');
var path = require('path');

// globs对象：保存用到的各种路径
// ------------------------------
var paths = {};
paths.cssSrc = src + 'static/css/';
paths.icoSrc = src + 'static/icons/';

// bootstrap相关路径
paths.bootstrap = src + 'static/lib/bootstrap/';
paths.bootstrapDest = dest + 'static/lib/bootstrap/';
paths.bootstrapCssDest = dest + 'static/lib/bootstrap/css/';
paths.bootstrapScss = paths.bootstrap + 'stylesheets/bootstrap.twui.scss';
paths.bootstrapScssFiles = [paths.bootstrap + 'stylesheets/**/*.scss'];
paths.bootstrapScript = paths.bootstrap + 'javascripts/bootstrap.min.js';

// twui相关路径
paths.twui = src + 'static/lib/twui/';
paths.twuiDest = dest + 'static/lib/twui/';
paths.twuiScss = paths.twui + 'stylesheets/twui.scss';
paths.twuiCssFiles = [paths.twui + '**/*.scss', paths.twui + '**/*.css'];
paths.twuiHtmlFiles = paths.twui + '**/*.html';
paths.twuiCore = paths.twui + 'core/';
paths.twuiScriptConcat = [paths.twuiCore + '_core.js', paths.twuiCore + '_base.js', paths.twuiCore + '_config.js', paths.twuiCore + '_common.js', paths.twui + 'modules/**/*.js'];
paths.twuiScriptFiles = paths.twui + '**/*.js';
paths.twuiModulesDir = paths.twui + 'modules/';
paths.twuiModuleFiles = [paths.twui + 'modules/**/**'];
paths.twuiDesign = [paths.twui + 'design/**/**'];

// javascript库相关路径
paths.jsLibFiles = [src + 'static/lib/javascripts/**/**'];

// 插件相关路径
paths.plugs = [src + 'static/plugs/**/**'];
paths.plugsDest = dest + 'static/plugs/';

// 项目html相关路径
paths.html = [src + 'web/**/*.html', '!' + src + 'web/include/*.*'];
paths.htmlDest = dest + 'web/';
paths.include = [src + 'web/include/**/_*.html', paths.twuiHtmlFiles];

// 项目scss及css相关路径
paths.mainScss = [paths.cssSrc + 'main.scss'];
paths.scss = [paths.cssSrc + '**/*.+(css|scss)', '!' + paths.cssSrc + 'import/_sprite.scss'];
paths.cssDest = dest + 'static/css/';
paths.cssImport = paths.cssSrc + 'import/';

// 项目图标、图片相关路径
paths.icons = [paths.icoSrc + '*.*', paths.icoSrc + '.*.*'];
paths.img = [src + 'static/images/**/**'];
paths.imgDest = dest + 'static/images/';

// 项目脚本相关路径
paths.scriptDest = dest + 'static/js/';
paths.script = [src + 'static/js/**/**'];

// 字体图标路径
paths.iconfont = [paths.cssSrc + 'fonts/**/**', paths.twui + 'stylesheets/fonts/**/**'];

// 快捷输入目录
paths.shortcut = [src + 'web/**/*.html', paths.cssSrc + '**/*.+(css|scss)', src + 'static/js/**/*.js'];

// 所有需要直接复制的文件
paths.copyFiles = paths.plugs.concat(paths.bootstrapScript, paths.jsLibFiles, paths.img, paths.script, paths.iconfont, paths.twuiModuleFiles, paths.twuiDesign);

// 任务对象:保存各种任务调用的函数
// ------------------------------
var tasks = {
    include: function (isModule) {
        var stream = gulp.src(paths.html).pipe(plumber());
        var repalceReg = /\s+@@[\w]+/g;

        if (!isModule) {
            stream = stream.pipe(changed(paths.htmlDest));
        }

        return stream.pipe(include()).pipe(replace(repalceReg,'')).pipe(gulp.dest(paths.htmlDest)).pipe(reload({ stream: true }));
    },
    server: function () {
        var opt = {
            notify: false,
            port: 8015,
            directory: true,
            server: {
                baseDir: dest
            }
        };

        server.init(opt);
    },
    sass: function (srcPath,destPath) {
        var opt = {
            outputStyle: 'compact'
        };

        return gulp.src(srcPath).pipe(sass(opt)).on('error', errorHandler).pipe(postcss([autoprefixer()])).pipe(replace(/^\n/gm, '')).pipe(gulp.dest(destPath)).pipe(reload({ stream: true }));
    },
    sprite: function () {
        var opt = {
            imgName: 'icons.png',
            cssName: '_sprite.scss',
            cssFormat: 'css',
            imgPath: '../images/icons.png',
            padding: 10,
            cssTemplate: 'csstemplate/px.handlebars',
            cssVarMap: function (sprite) {
                var cssName = sprite.name.replace(/;/g, ':').replace(/\)/g, '>');
                var nameList = cssName.split(',');
                for (var i = 0; i < nameList.length; i++) {
                    nameList[i] = /\s(\S*)$/.test(nameList[i]) ? nameList[i].replace(/\s(\S*)$/, ' .ico-$1') : nameList[i].replace(/(^.*$)/, '.ico-$1');
                }

                sprite.rem = {
                    offset_x: sprite.x / 40 + 'rem',
                    offset_y: sprite.y / 40 + 'rem',
                    width: sprite.width / 40 + 'rem',
                    height: sprite.height / 40 + 'rem',
                    total_width: sprite.total_width / 40 + 'rem',
                    total_height: sprite.total_height / 40 + 'rem'
                };

                sprite.name = nameList.join(',');
            }
        };

        if (isMobile) opt.cssTemplate = 'csstemplate/rem.handlebars';

        var spriteData = gulp.src(paths.icons).pipe(sprite(opt));
        spriteData.img.pipe(gulp.dest(paths.imgDest));

        var gtReg = /&gt;/g;
        return spriteData.css.pipe(replace(gtReg,'>')).pipe(gulp.dest(paths.cssImport));
    },
    copyFiles: function () {
        return gulp.src(paths.copyFiles, {base: src }).pipe(plumber()).pipe(changed(dest)).pipe(gulp.dest(dest)).pipe(reload({ stream: true }));
    },
    script: function (srcPath,filename,destPath) {
        return gulp.src(srcPath).pipe(concat(filename)).pipe(gulp.dest(destPath)).pipe(reload({ stream: true }));
    },
    shortcut: function (file) {
        var root = paths.twuiModulesDir;

        fs.readFile(file, 'utf8', function (err, sourceContent) {
            var shortcutReg = /(html|scss|js)@(\w*)/m;

            var matches = shortcutReg.exec(sourceContent);
            if (matches === null) return;

            var filename = matches[2] + '.' + matches[1];
            var filePath = undefined;

            +function getFilePath(root) {
                fs.readdirSync(root).forEach(function (name) {
                    var dirPath = path.join(root, name);

                    if (name.replace(/^_/, '') == filename) {
                        filePath = dirPath;
                    }

                    if (fs.statSync(dirPath).isDirectory()) {
                        getFilePath(dirPath);
                    }
                });
            }(root);

            if (!filePath) {
                console.log('\n(⊙_⊙)妈了个鸡蛋，未找到对应的快捷内容...\n');
                return;
            }

            fs.readFile(filePath, 'utf8', function (err, content) {
                sourceContent = sourceContent.replace(shortcutReg, content);
                fs.writeFile(file, sourceContent,'utf8',function () {
                    console.log("\n╮(￣▽￣)╭so easy,内容已替换\n");
                });
            });
        });
    },
    del: function (delpath) {
        delpath = delpath.replace(/\\/g, '/').replace(src, dest);
        del.sync(delpath);
    }
};

// 函数:错误处理
// ------------------------------
var errorHandler = function (error) {
    console.error('\n⊙﹏⊙‖∣° 自己猜，哪出问题了...\n');
    this.emit('end');
};

// 任务:按html模板生成html文件
// ------------------------------
gulp.task('html', function () {
    return tasks.include();
});

// 任务:编译_bootstrap.twui.scss
// ------------------------------
gulp.task('bootstrapSass', function () {
    return tasks.sass(paths.bootstrapScss, paths.bootstrapCssDest);
});

// 任务:编译_twui.scss
// ------------------------------
gulp.task('twuiSass', function () {
    return tasks.sass(paths.twuiScss, paths.twuiDest);
});

// 任务:twui脚本处理
// ------------------------------
gulp.task('twuiScript', function () {
    return tasks.script(paths.twuiScriptConcat, 'twui.js', paths.twuiDest);
});

// 任务:编译_main.scss
// ------------------------------
gulp.task('sass', function () {
    return tasks.sass(paths.mainScss, paths.cssDest);
});

// 任务:合并sprite图片
// ------------------------------
gulp.task('sprite', function () {
   return tasks.sprite();
});

// 任务:先合并sprite图片，再生成sass
// ------------------------------------
gulp.task('sassAll', ['sprite'], function () {
    return tasks.sass(paths.mainScss, paths.cssDest);
});

// 任务:复制文件
// ------------------------------
gulp.task('copyFiles', function () {
    return tasks.copyFiles();
});

// 任务:快捷输入
// ------------------------------
gulp.task('shortcut', function () {
    return tasks.shortcut();
});

// 任务:浏览器自动刷新
// ------------------------------
gulp.task('server', ['bootstrapSass', 'twuiSass', 'twuiScript', 'sassAll', 'copyFiles','html'], function () {
    tasks.server();
});

// 任务：监控src目录文件的变动
// ------------------------------
gulp.task('watch', function () {
    var taskHandler = function (event, callback) {
        if (event.type == 'deleted') {
            tasks.del(event.path);
        } else {
           return callback();
        }
    };

    // 监控：bootstrap样式文件变化
    // ------------------------------
    gulp.watch(paths.bootstrapScssFiles, ['bootstrapSass']);

    // 监控：twui样式文件变化
    // ------------------------------
    gulp.watch(paths.twuiCssFiles, ['twuiSass']);

    // 监控：twui脚本文件变化
    // ------------------------------
    gulp.watch(paths.twuiScriptFiles, ['twuiScript']);

    // 监控：html文件的改变
    // ------------------------------
    gulp.watch(paths.html, function (event) {
        return taskHandler(event, tasks.include);
    });

    // 监控：include文件改变
    // ------------------------------
    gulp.watch(paths.include, function () {
        return tasks.include(true);
    });

    // 监控：scss文件改变
    // ------------------------------
    gulp.watch(paths.scss, ['sass']);

    // 监控：图标改变
    // ------------------------------
    gulp.watch(paths.icons, ['sassAll']);

    // 监控：所有需要直接复制的文件改变
    // ------------------------------
    gulp.watch(paths.copyFiles, function (event) {
        return taskHandler(event, tasks.copyFiles);
    });

    // 监控：允许快捷输入的文件改变
    // ------------------------------
    gulp.watch(paths.shortcut, function (event) {
        if (event.type === 'deleted') return;
        console.log('\n(→_→)查询中，稍候...\n');

        // 妹的，为什么要延时2000ms系统才能监控到改变
        // 哪位大神知道原因后请告知一声哦
        // ------------------------------------------------------------
        setTimeout(function () {
            tasks.shortcut(event.path);
        }, 2000);
    });

    // 监控：脚本变化
    // ------------------------------
    gulp.watch(paths.scriptAll, ['script']);
});

// 任务:默认任务
// ------------------------------
gulp.task('default', ['server', 'watch']);