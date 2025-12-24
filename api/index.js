import { kv } from '@vercel/kv';
import { parse } from 'querystring';

export default async function handler(req, res) {
    try {
        // 1. GET NEWS (Loads automatically when you visit the homepage)
        if (req.method === 'GET') {
            const news = await kv.get('news_data') || [];
            return res.status(200).json(news);
        }

        // 2. PUBLISH NEWS (Saves automatically when you hit 'Publish')
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const data = parse(body);
                if (data.password !== "123") return res.status(403).send("Wrong Password");

                const currentNews = await kv.get('news_data') || [];
                currentNews.unshift({
                    title: data.title,
                    content: data.content,
                    date: new Date().toLocaleString()
                });
                
                await kv.set('news_data', currentNews);
                res.writeHead(302, { Location: '/' });
                res.end();
            });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: "Database Connection Failed" });
    }
}
