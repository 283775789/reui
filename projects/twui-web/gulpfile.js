﻿/* ------------------------------------------------------------
 * 版本:1.0
 * 描述:gulp任务
 * ------------------------------------------------------------ */
// 项目配置
// ------------------------------
var isMobile = false;
var src = 'src/';
var dest = 'dist/';

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
paths.twui = [src + 'static/lib/twui/'];
paths.twuiDest = dest + 'static/lib/twui/';
paths.twuiScss = paths.twui + 'stylesheets/twui.scss';
paths.twuiCssFiles = [paths.twui + '**/*.scss', paths.twui + '**/*.css'];
paths.twuiHtmlFiles = paths.twui + '**/*.html';
paths.twuiCore = paths.twui + 'core/';
paths.twuiScriptConcat = [paths.twuiCore + '_core.js', paths.twuiCore + '_base.js', paths.twuiCore + '_config.js', paths.twuiCore + '_common.js', paths.twui + 'modules/**/*.js'];
paths.twuiScriptFiles = paths.twui + '**/*.js';

// javascript库相关路径
paths.jsLibFiles = [src + 'static/lib/javascripts/**/**'];

// 插件相关路径
paths.plugs = [src + 'static/plugs/**/**'];
paths.plugsDest = dest + 'static/plugs/';

// 项目html相关路径
paths.html = [src + 'html/**/*.html', '!' + src + 'html/include/*.*'];
paths.htmlDest = dest + 'html/';
paths.include = [src + 'html/include/**/_*.html', paths.twuiHtmlFiles];

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

// 所有需要直接复制的文件
paths.copyFiles = paths.plugs.concat(paths.bootstrapScript, paths.jsLibFiles, paths.img, paths.script);

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
            outputStyle:'expanded'
        };

        return gulp.src(srcPath).pipe(sass(opt)).on('error', errorHandler).pipe(postcss([autoprefixer()])).pipe(gulp.dest(destPath)).pipe(reload({ stream: true }));
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
    del: function (delpath) {
        delpath = delpath.replace(/\\/g, '/').replace(src, dest);
        del.sync(delpath);
    }
};

// 函数:错误处理
// ------------------------------
var errorHandler = function (error) {
    console.error(error);
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

// 任务:浏览器自动刷新
// ------------------------------
gulp.task('server', ['bootstrapSass', 'twuiSass', 'twuiScript', 'sassAll', 'copyFiles', 'html'], function () {
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
    
    // 监控：脚本变化
    // ------------------------------
    gulp.watch(paths.scriptAll, ['script']);
});

// 任务:默认任务
// ------------------------------
gulp.task('default', ['server', 'watch']);