import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        const [enRes, frRes, rwRes] = await Promise.all([
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=en&sortBy=publishedAt&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=fr&sortBy=publishedAt&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda+OR+Kigali&sortBy=publishedAt&apiKey=${API_KEY}`)
        ]);

        const en = await enRes.json();
        const fr = await frRes.json();
        const rw = await rwRes.json();

        // Helper to format the data consistently
        const clean = (articles) => (articles || []).slice(0, 15).map(art => ({
            title: art.title,
            description: art.description || "No description available.",
            urlToImage: art.urlToImage || null,
            publishedAt: art.publishedAt // Keep raw date for the script to fix
        }));

        await kv.set('news_en', clean(en.articles));
        await kv.set('news_fr', clean(fr.articles));
        await kv.set('news_rw', clean(rw.articles));

        res.status(200).send("System Fixed: Multilingual News Updated!");
    } catch (error) {
        res.status(500).send(error.message);
    }
}
