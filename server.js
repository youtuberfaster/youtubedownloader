const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.get('/api/video-info', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video info
        const info = await ytdl.getInfo(url);
        const { videoDetails } = info;

        res.json({
            title: videoDetails.title,
            duration: videoDetails.lengthSeconds,
            thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
            author: videoDetails.author.name,
            views: videoDetails.viewCount
        });

    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
});

app.get('/api/download', async (req, res) => {
    try {
        const { videoId, quality } = req.query;
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid video ID' });
        }

        const info = await ytdl.getInfo(url);
        let format;

        if (quality === 'audio') {
            format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
        } else {
            // Choose video format based on quality
            format = ytdl.chooseFormat(info.formats, { quality: quality });
        }

        if (!format) {
            return res.status(404).json({ error: 'Format not available' });
        }

        // Set headers for download
        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.${format.container}"`);
        
        // Stream the video
        ytdl(url, { format }).pipe(res);

    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Failed to download video' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});