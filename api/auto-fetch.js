import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY;

    try {
        // Single focused search for Rwanda
        const response = await fetch(`https://newsapi.org/v2/everything?q=Rwanda&sortBy=publishedAt&pageSize=30&apiKey=${API_KEY}`);
        const data = await response.json();

        const cleanArticles = (data.articles || [])
            .filter(art => art.title && art.urlToImage)
            .slice(0, 20)
            .map(art => ({
                title: art.title,
                description: art.description || (art.content ? art.content.split('[+')[0] : "Official news coverage from Rwanda."),
                urlToImage: art.urlToImage,
                publishedAt: art.publishedAt,
                url: art.url
            }));

        // Save to the single main news key
        await kv.set('news_data', cleanArticles);

        res.status(200).json({ message: "Robot successfully updated the news feed!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
