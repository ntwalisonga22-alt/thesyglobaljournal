import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 1. Your NewsAPI Key
    const API_KEY = '17010771c65e4487b642a221bcc86157'; 

    try {
        // 2. Fetch the top 10 news stories from the world
        const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${API_KEY}`);
        const data = await response.json();

        if (data.status !== "ok") throw new Error("NewsAPI Error");

        // 3. Transform them for your site
        const automatedNews = data.articles.map(art => ({
            title: art.title,
            content: art.description || "No description available.",
            category: "Other", // You can change this to 'Politics' or 'Tech'
            date: new Date().toLocaleDateString()
        }));

        // 4. Update the KV database
        await kv.set('news_data', automatedNews);

        res.status(200).send("News Auto-Updated!");
    } catch (error) {
        res.status(500).send("Failed to fetch: " + error.message);
    }
}
