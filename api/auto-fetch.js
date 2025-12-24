import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY; 

    try {
        // Fetching 20 articles to ensure we have enough for different categories
        const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${API_KEY}`);
        const data = await response.json();

        if (data.status !== "ok") throw new Error("NewsAPI Error");

        const automatedNews = data.articles.map(art => {
            // Simple logic to "guess" the category based on keywords
            let category = "Other";
            const text = (art.title + " " + art.description).toLowerCase();
            
            if (text.includes("election") || text.includes("government") || text.includes("biden") || text.includes("trump")) category = "Politics";
            else if (text.includes("game") || text.includes("nba") || text.includes("football") || text.includes("score")) category = "Sports";
            else if (text.includes("tech") || text.includes("apple") || text.includes("ai") || text.includes("google")) category = "Tech";
            else if (text.includes("movie") || text.includes("music") || text.includes("star") || text.includes("show")) category = "Entertainment";

            return {
                title: art.title,
                content: art.description || "View full story on source site.",
                category: category, 
                date: new Date().toLocaleDateString()
            };
        });

        await kv.set('news_data', automatedNews);
        res.status(200).send("Success: Organized News Updated!");
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
}
