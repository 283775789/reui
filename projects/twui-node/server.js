const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const {homepage} = require('./config');
const mime = require('./mime');
let port = 9898;

console.log(__dirname);

// http处理
function httpHandler(req, rep) {
    let pathname = url.parse(req.url).pathname;

    if (pathname === '/') {
        pathname = homepage;
    }

    route(pathname,rep);
}

// 请求处理
let requestHandler = {
    // 处理静态资源
    static: function (pathname, extname, rep) {
        let content = fs.readFile(pathname, (err, data) => {
            if (err) return;

            rep.writeHead(200, { "Content-Type": mime[extname] });
            rep.write(data);
            rep.end();
        });
    }
};

// 路由
function route(pathname, rep) {
    pathname = '.' + pathname;
    let extname = path.extname(pathname).substring(1);

    console.log(pathname);
    console.log(extname);

    // 静态资源路由
    if (typeof mime[extname] === 'string') {
        requestHandler.static(pathname,extname,rep);
    } else {
        console.log('not static request.')
    }
}

// 监听http
http.createServer(httpHandler).listen(port);







