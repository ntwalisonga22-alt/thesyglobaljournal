const http = require('http');
const fs = require('fs');
const queryString = require('querystring');

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile('index.html', (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else if (req.url === '/get-news' && req.method === 'GET') {
        fs.readFile('news.json', (err, data) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(data || '[]');
        });
    } else if (req.url === '/publish' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const post = queryString.parse(body);
            fs.readFile('news.json', (err, data) => {
                const list = JSON.parse(data || '[]');
                list.unshift(post);
                fs.writeFile('news.json', JSON.stringify(list), () => {
                    res.writeHead(302, {'Location': '/'});
                    res.end();
                });
            });
        });
    }
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Journal is running at http://localhost:3000');
});