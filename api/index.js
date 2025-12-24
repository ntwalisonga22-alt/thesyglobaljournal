import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 1. SHOW NEWS (When your homepage asks for it)
    if (req.method === 'GET') {
        const news = await kv.get('news_data') || [];
        return res.status(200).json(news);
    }

    // 2. SAVE MANUAL NEWS (When you use the Admin Form)
    if (req.method === 'POST') {
        const { password, title, content, category, image } = req.body;

        // Simple Security: Change '1234' to your private password
        if (password !== '1234') {
            return res.status(401).send("Incorrect Admin Password!");
        }

        // Get existing news first
        let currentNews = await kv.get('news_data') || [];

        // Create your new story object
        const newStory = {
            title,
            content,
            category,
            image: image || null, // Use the link you pasted or nothing
            date: new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            })
        };

        // Put your new story at the very TOP of the list
        currentNews.unshift(newStory);

        // Keep only the 25 most recent stories so the site stays fast
        const updatedNews = currentNews.slice(0, 25);

        // Save back to the database
        await kv.set('news_data', updatedNews);

        return res.status(200).send(`
            <h1>Successfully Published!</h1>
            <p>Your story "${title}" is now live on the homepage.</p>
            <a href="/admin.html">Go back to Admin</a> | <a href="/">View Homepage</a>
        `);
    }

    return res.status(405).send("Method Not Allowed");
}
