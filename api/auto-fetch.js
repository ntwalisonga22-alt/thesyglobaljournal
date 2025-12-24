import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const API_KEY = process.env.NEWS_API_KEY; 

    try {
        // We search for Rwanda news specifically
        const response = await fetch(`https://newsapi.org/v2/everything?q=Rwanda&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`);
        const data = await response.json();

        if (data.status !== "ok") {
            return res.status(500).json({ error: "NewsAPI Error: " + data.message });
        }

        const automatedNews = data.articles.map(art => {
            // 1. Categorization Logic
            let category = "Other";
            const text = (art.title + " " + (art.description || "")).toLowerCase();
            
            if (text.includes("kagame") || text.includes("government") || text.includes("rpf") || text.includes("parliament") || text.includes("minister")) {
                category = "Politics";
            } else if (text.includes("ferwafa") || text.includes("cycling") || text.includes("basketball") || text.includes("apr") || text.includes("rayons") || text.includes("game")) {
                category = "Sports";
            } else if (text.includes("ict") || text.includes("kigali innovation") || text.includes("startup") || text.includes("ai") || text.includes("tech")) {
                category = "Tech";
            } else if (text.includes("visit rwanda") || text.includes("tourism") || text.includes("movie") || text.includes("music") || text.includes("art")) {
                category = "Entertainment";
            }

            // 2. Return the data with the Image included
            return {
                title: art.title,
                content: art.description || "Click to read the full coverage on the source website.",
                image: art.urlToImage || null, // This grabs the picture from the news source
                url: art.url, // Link to the original article
                category: category, 
                date: new Date(art.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };
        });

        // 3. Save the new list to your Vercel KV database
        await kv.set('news_data', automatedNews);
        
        res.status(200).send("Success: Rwandan News with Images Updated!");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
