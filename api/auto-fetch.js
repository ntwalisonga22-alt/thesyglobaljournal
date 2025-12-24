import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        // Fetch English, French, and a general search for Kinyarwanda keywords
        const [enRes, frRes, rwRes] = await Promise.all([
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=en&pageSize=15&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=fr&pageSize=15&apiKey=${API_KEY}`),
            // For Kinyarwanda, we search local sources or keywords like 'Amakuru'
            fetch(`https://newsapi.org/v2/everything?q=Amakuru+OR+Rwanda&pageSize=10&apiKey=${API_KEY}`)
        ]);

        const enData = await enRes.json();
        const frData = await frRes.json();
        const rwData = await rwRes.json();

        // Save them into 3 different "drawers" in your database
        await kv.set('news_en', enData.articles || []);
        await kv.set('news_fr', frData.articles || []);
        await kv.set('news_rw', rwData.articles || []);

        res.status(200).send("Success: Multilingual News Updated!");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
