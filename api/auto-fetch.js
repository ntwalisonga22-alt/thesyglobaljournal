import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        // Fetch news for English, French, and a general search for Rwanda (Kinyarwanda keywords)
        const [enRes, frRes, rwRes] = await Promise.all([
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=fr&sortBy=publishedAt&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda+OR+Kigali+OR+Amakuru&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`)
        ]);

        const enData = await enRes.json();
        const frData = await frRes.json();
        const rwData = await rwRes.json();

        // Helper function to clean the data and remove broken articles
        const cleanArticles = (articles) => {
            return (articles || [])
                .filter(art => art.title && art.urlToImage) // Only keep articles with images
                .slice(0, 15) // Keep top 15
                .map(art => ({
                    title: art.title,
                    description: art.description || "No description available.",
                    urlToImage: art.urlToImage,
                    publishedAt: art.publishedAt
                }));
        };

        // Save into three separate database keys
        await kv.set('news_en', cleanArticles(enData.articles));
        await kv.set('news_fr', cleanArticles(frData.articles));
        await kv.set('news_rw', cleanArticles(rwData.articles));

        res.status(200).json({ 
            message: "Success: SY News Robot updated all languages!",
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
