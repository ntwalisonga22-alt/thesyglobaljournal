import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // GET: Serve news to the homepage
    if (req.method === 'GET') {
        const lang = req.query.lang || 'en';
        const news = await kv.get(`news_${lang}`) || [];
        return res.status(200).json(news);
    }

    // POST: Handle Manual Admin Publishing
    if (req.method === 'POST') {
        const { password, title, content, image } = req.body;
        if (password !== '1234') return res.status(401).send("Unauthorized");

        let currentNews = await kv.get('news_en') || [];
        const newStory = {
            title,
            description: content,
            urlToImage: image || null,
            publishedAt: new Date().toISOString(),
            url: "#"
        };

        currentNews.unshift(newStory);
        await kv.set('news_en', currentNews.slice(0, 20));
        return res.status(200).send("Story Published Successfully!");
    }
}
