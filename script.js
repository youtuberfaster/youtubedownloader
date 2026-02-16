// Mobile menu toggle
document.querySelector('.menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const menu = document.querySelector('.nav-menu');
    const menuBtn = document.querySelector('.menu-btn');
    
    if (!menu.contains(event.target) && !menuBtn.contains(event.target) && menu.classList.contains('active')) {
        menu.classList.remove('active');
    }
});

// Main functionality
document.getElementById('analyzeBtn').addEventListener('click', analyzeVideo);
document.getElementById('videoUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        analyzeVideo();
    }
});

async function analyzeVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    
    if (!url) {
        showError('Please enter a YouTube video URL');
        return;
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    if (!youtubeRegex.test(url)) {
        showError('Please enter a valid YouTube video URL');
        return;
    }

    // Show loading, hide previous results
    showLoading(true);
    hideError();
    document.getElementById('videoInfo').style.display = 'none';

    try {
        // Extract video ID
        const videoId = extractVideoId(url);
        
        // Fetch video info from backend
        const response = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch video information');
        }

        // Display video info
        displayVideoInfo(data, videoId);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&]+)/,
        /(?:youtu\.be\/)([^?]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function displayVideoInfo(data, videoId) {
    document.getElementById('thumbnail').src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    document.getElementById('videoTitle').textContent = data.title || 'Video Title';
    document.getElementById('videoDuration').textContent = formatDuration(data.duration);
    
    // Generate download links
    const downloadGrid = document.getElementById('downloadLinks');
    downloadGrid.innerHTML = '';
    
    const qualities = [
        { label: '1080p HD', quality: 'hd1080', format: 'mp4' },
        { label: '720p HD', quality: 'hd720', format: 'mp4' },
        { label: '480p', quality: 'medium', format: 'mp4' },
        { label: '360p', quality: 'low', format: 'mp4' },
        { label: 'Audio MP3', quality: 'audio', format: 'mp3' }
    ];
    
    qualities.forEach(q => {
        const downloadItem = document.createElement('div');
        downloadItem.className = 'download-item';
        downloadItem.innerHTML = `
            <div class="quality">${q.label}</div>
            <div class="format">${q.format.toUpperCase()}</div>
            <button class="download-btn" onclick="downloadVideo('${videoId}', '${q.quality}')">
                <i class="fas fa-download"></i> Download
            </button>
        `;
        downloadGrid.appendChild(downloadItem);
    });
    
    document.getElementById('videoInfo').style.display = 'block';
    
    // Smooth scroll to video info
    document.getElementById('videoInfo').scrollIntoView({ behavior: 'smooth' });
}

function formatDuration(seconds) {
    if (!seconds) return 'Duration unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function downloadVideo(videoId, quality) {
    // For demo - show message
    alert(`Download started for video ID: ${videoId} (${quality})\n\nNote: This is a demo. In production, this would trigger actual download.`);
    
    // Real implementation would be:
    // window.location.href = `/api/download?videoId=${videoId}&quality=${quality}`;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('analyzeBtn').disabled = show;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});