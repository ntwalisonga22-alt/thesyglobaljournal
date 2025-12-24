import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const news = await kv.get('news_data') || [];
        return res.status(200).json(news);
    }

    if (req.method === 'POST') {
        const { password, title, content, image } = req.body;
        if (password !== '1234') return res.status(401).send("Unauthorized");

        let current = await kv.get('news_data') || [];
        const manual = {
            title,
            description: content,
            image: image || null,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        current.unshift(manual);
        await kv.set('news_data', current.slice(0, 20));
        return res.status(200).send("Journal Published!");
    }
}
