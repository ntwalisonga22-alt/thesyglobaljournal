import { kv } from '@vercel/kv';

const API_KEY = '17010771c65e4487b642a221bcc86157'; // Put your key here

export default async function handler(req, res) {
    try {
        // 1. Fetch news from the world (Example: Tech news)
        const response = await fetch(`https://newsapi.org/v2/top-headlines?category=technology&language=en&apiKey=${API_KEY}`);
        const data = await response.json();

        // 2. Format the news for your site
        const newArticles = data.articles.map(art => ({
            title: art.title,
            content: art.description || art.content,
            category: 'Tech',
            date: new Date().toLocaleString()
        }));

        // 3. Save to your free KV database
        await kv.set('news_data', newArticles);

        res.status(200).send("News Updated Successfully!");
    } catch (error) {
        res.status(500).send("Error fetching news");
    }
}
