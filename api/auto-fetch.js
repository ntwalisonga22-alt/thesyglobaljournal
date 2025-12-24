import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        const [enRes, frRes, rwRes] = await Promise.all([
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=fr&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`),
            fetch(`https://newsapi.org/v2/everything?q=Rwanda+OR+Kigali+OR+Amakuru&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`)
        ]);

        const enData = await enRes.json();
        const frData = await frRes.json();
        const rwData = await rwRes.json();

        const cleanArticles = (articles) => {
            return (articles || [])
                .filter(art => art.title && art.urlToImage)
                .slice(0, 15)
                .map(art => ({
                    title: art.title,
                    description: art.description || (art.content ? art.content.split('[+')[0] : "Click to read the full story on the official portal."),
                    urlToImage: art.urlToImage,
                    publishedAt: art.publishedAt,
                    url: art.url
                }));
        };

        await kv.set('news_en', cleanArticles(enData.articles));
        await kv.set('news_fr', cleanArticles(frData.articles));
        await kv.set('news_rw', cleanArticles(rwData.articles));

        res.status(200).json({ message: "Multi-language database successfully updated!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
