import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // GET: Serve all news to the homepage
    if (req.method === 'GET') {
        const news = await kv.get('news_data') || [];
        return res.status(200).json(news);
    }

    // POST: Manual Admin Publishing
    if (req.method === 'POST') {
        const { password, title, content, image } = req.body;
        if (password !== '1234') return res.status(401).send("Unauthorized");

        let currentNews = await kv.get('news_data') || [];
        const newStory = {
            title,
            description: content,
            urlToImage: image || null,
            publishedAt: new Date().toISOString(),
            url: "#"
        };

        currentNews.unshift(newStory);
        await kv.set('news_data', currentNews.slice(0, 30));
        return res.status(200).send("Published! Refresh your site.");
    }
}
