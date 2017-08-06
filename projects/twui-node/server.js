const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('./mime');
const { index, indexNav, indexMd } = require('./config');
let port = 9999;

// 文件数据缓存集
let Dataset = function () {
    this.length = 0;
}

// 获取缓存数据,key为文件数据路径
Dataset.prototype.get = function (key, callback) {
    let data = undefined;
    let me = this;

    if (this[key]) {
        data = this[key];
        callback(data);
    } else {
        fs.readFile(key, function (err,data) {
            me[key] = data;
            me.length++;
            callback(data);
        });
    }
};

let dataset = new Dataset();

// http处理
function httpHandler(req, rep) {
    let pathname = url.parse(req.url).pathname;
    route(pathname, req, rep);
}

// 响应处理
function repHandler(rep, status, mimeType, data) {
    rep.writeHead(status, { "Content-Type": mimeType });
    rep.write(data);
    rep.end();
}

// 请求处理
let requestHandler = {
    // 处理静态资源
    static: function (pathname, rep) {
        dataset.get(pathname, (data) => {
            if (!data) return;
            let extname = path.extname(pathname).substring(1);
            repHandler(rep, 200, mime[extname], data);
        });
    }
};

// 路由
function route(pathname, req, rep) {
    // 首页及GET请求路径转换
    if (pathname === '/' || (req.method === "GET" && (/^\/web/.test(pathname) || /^\/static\/lib\/twui\/modules\//.test(pathname)))) {
        pathname = index;
    }

    if (pathname === '/nav.html') {
        pathname = indexNav;
    }

    if (pathname === '/.md') {
        pathname = indexMd;
    }

    pathname = '.' + pathname;

    console.log(pathname);

    // 静态资源路由
    requestHandler.static(pathname, rep);
}

// 监听http
http.createServer(httpHandler).listen(port);







