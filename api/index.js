import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const news = await kv.get('news_data') || [];
        return res.status(200).json(news);
    }

    if (req.method === 'POST') {
        const { password, title, content, image, category } = req.body;
        if (password !== '1234') return res.status(401).send("Unauthorized");

        let currentNews = await kv.get('news_data') || [];
        const manualPost = {
            title,
            description: content,
            urlToImage: image || null,
            publishedAt: new Date().toISOString(),
            category: category || "Admin"
        };

        currentNews.unshift(manualPost);
        await kv.set('news_data', currentNews.slice(0, 30));
        return res.status(200).send("Published successfully!");
    }
}
