import { kv } from '@vercel/kv';
import { parse } from 'querystring';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const news = await kv.get('news_data') || [];
            return res.status(200).json(news);
        }

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
                    video: data.video || 'none',
                    category: data.category || 'Other', // Saves the category
                    date: new Date().toLocaleString()
                });
                await kv.set('news_data', currentNews);
                res.writeHead(302, { Location: '/' });
                res.end();
            });
            return;
        }
    } catch (e) {
        res.status(500).json({ error: "Connection Error" });
    }
}
