const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const {homepage, staticType} = require('./config');
let port = 9898;

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
    // 静态资源
    static: function (pathname, rep) {
        let content = fs.readFile(pathname, 'utf8', (err, data) => {
            if (err) throw err;

            rep.writeHead(200, { "Content-Type": "text/html" });
            rep.write(data);
            rep.end();
        });
    }
};

// 路由
function route(pathname, rep) {
    pathname = './' + pathname;
    let extname = path.extname(pathname);

    // 静态资源路由
    if (staticType.indexOf(extname) != -1) {
        requestHandler.static(pathname,rep);
    } else {
        console.log('not static request.')
    }
}

// 监听http
http.createServer(httpHandler).listen(port);
