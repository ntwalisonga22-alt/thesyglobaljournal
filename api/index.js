const http = require('http');
const fs = require('fs');
const path = require('path');
const queryString = require('querystring');

// CHANGE THIS TO YOUR SECRET PASSWORD
const ADMIN_PASSWORD = "mysecretnews"; 

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    if (method === 'GET' && url === '/') {
        // Show Reader Page
        fs.readFile(path.join(__dirname, '../index.html'), (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else if (method === 'GET' && url === '/admin') {
        // Show Secret Admin Page
        fs.readFile(path.join(__dirname, '../admin.html'), (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
    } else if (method === 'GET' && url === '/api/get-news') {
        // Send news data
        fs.readFile(path.join(__dirname, '../news.json'), (err, data) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(data || '[]');
        });
    } else if (method === 'POST' && url === '/api/publish') {
        // Handle Publishing News
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const formData = queryString.parse(body);
            
            // SECURITY CHECK: Check if password is correct
            if (formData.password !== ADMIN_PASSWORD) {
                res.writeHead(403);
                return res.end("Error: Wrong Admin Password!");
            }

            fs.readFile(path.join(__dirname, '../news.json'), (err, data) => {
                const news = JSON.parse(data || '[]');
                news.unshift({
                    title: formData.title,
                    content: formData.content,
                    video: formData.video,
                    date: new Date().toLocaleString()
                });
                
                fs.writeFile(path.join(__dirname, '../news.json'), JSON.stringify(news), () => {
                    res.writeHead(302, {'Location': '/'});
                    res.end();
                });
            });
        });
    }
});

// For local testing
if (require.main === module) {
    server.listen(3000, '127.0.0.1', () => {
        console.log('Journal running at http://localhost:3000');
        console.log('Admin access at http://localhost:3000/admin');
    });
}

module.exports = server;