import { kv } from '@vercel/kv';
import { parse } from 'querystring';

export default async function handler(req, res) {
    try {
        // --- 1. GET NEWS (For your index.html) ---
        if (req.method === 'GET') {
            const news = await kv.get('news_data') || [];
            return res.status(200).json(news);
        }

        // --- 2. PUBLISH NEWS (For your admin.html) ---
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const data = parse(body);

                // Use "123" as your password for now
                if (data.password !== "123") {
                    return res.status(403).send("Unauthorized: Wrong Password");
                }

                // Get existing news, add new one to the TOP
                const currentNews = await kv.get('news_data') || [];
                const newStory = {
                    title: data.title,
                    content: data.content,
                    date: new Date().toLocaleString()
                };

                currentNews.unshift(newStory);
                await kv.set('news_data', currentNews);

                // Send user back to homepage to see their work
                res.writeHead(302, { Location: '/' });
                res.end();
            });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to connect to KV" });
    }
}