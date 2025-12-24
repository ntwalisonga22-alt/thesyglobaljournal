import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;
    try {
        // Fetches top global headlines (no specific country)
        const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=25&apiKey=${API_KEY}`);
        const data = await response.json();
        
        const clean = (data.articles || []).filter(a => a.urlToImage && a.description).map(a => ({
            title: a.title,
            description: a.description,
            image: a.urlToImage,
            date: new Date(a.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        }));

        // Reset the database with international headlines
        await kv.set('news_data', clean);
        res.status(200).send("Global Server Sync Successful");
    } catch (e) {
        res.status(500).send(e.message);
    }
}
