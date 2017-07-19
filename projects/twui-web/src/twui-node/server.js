'use strict';
var http = require('http');
var url = require('url');
var fs = require('fs');
var port = 80;

function route(pathname) {
    switch (pathname) {
        case '/':
            // dosomthing
            break;
    }
}

http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;

    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end(pathname);
}).listen(port);