import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=Rwanda&sortBy=publishedAt&pageSize=30&apiKey=${API_KEY}`);
        const data = await response.json();

        if (!data.articles) throw new Error("No articles found");

        const cleanArticles = data.articles
            .filter(art => art.title && art.urlToImage)
            .slice(0, 20)
            .map(art => ({
                title: art.title,
                description: art.description || (art.content ? art.content.split('[+')[0] : "Latest news coverage from Rwanda."),
                urlToImage: art.urlToImage,
                publishedAt: art.publishedAt,
                category: "Rwanda" 
            }));

        await kv.set('news_data', cleanArticles);

        res.status(200).json({ status: "Success", count: cleanArticles.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
