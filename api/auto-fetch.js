import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=Rwanda&sortBy=publishedAt&pageSize=25&apiKey=${API_KEY}`);
        const data = await response.json();

        const cleanData = (data.articles || [])
            .filter(art => art.title && art.urlToImage && art.description)
            .slice(0, 15)
            .map(art => ({
                title: art.title,
                description: art.description,
                image: art.urlToImage,
                date: new Date(art.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            }));

        await kv.set('news_data', cleanData);
        res.status(200).send("Database Synced");
    } catch (error) {
        res.status(500).send(error.message);
    }
}
