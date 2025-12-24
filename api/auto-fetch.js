import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY; 

    try {
        // We use the 'everything' endpoint to search specifically for Rwanda
        // 'q=Rwanda' targets the country
        // 'language=en' ensures the news is in English
        const response = await fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`);
        const data = await response.json();

        if (data.status !== "ok") {
            return res.status(500).json({ error: "NewsAPI Error: " + data.message });
        }

        const automatedNews = data.articles.map(art => {
            // Smart categorization based on keywords in the Rwandan news
            let category = "Other";
            const text = (art.title + " " + art.description).toLowerCase();
            
            if (text.includes("visit rwanda") || text.includes("tourism") || text.includes("park") || text.includes("music")) category = "Entertainment";
            else if (text.includes("kagame") || text.includes("government") || text.includes("rpf") || text.includes("parliament")) category = "Politics";
            else if (text.includes("ferwafa") || text.includes("cycling") || text.includes("basketball") || text.includes("apr") || text.includes("rayons")) category = "Sports";
            else if (text.includes("ict") || text.includes("kigali innovation") || text.includes("startup") || text.includes("bk")) category = "Tech";

            return {
                title: art.title,
                content: art.description || "Read the full story on the original news site.",
                category: category, 
                date: new Date(art.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };
        });

        // Save the fresh Rwandan news to your database
        await kv.set('news_data', automatedNews);
        
        res.status(200).send("Success: Rwandan News Updated!");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
