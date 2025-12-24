import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=Rwanda&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`);
        const data = await response.json();
        const clean = (data.articles || []).filter(a => a.urlToImage && a.description).map(a => ({
            title: a.title,
            description: a.description,
            image: a.urlToImage,
            date: new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        }));
        await kv.set('news_data', clean);
        res.status(200).send("Database Reset Successful");
    } catch (e) {
        res.status(500).send(e.message);
    }
}
