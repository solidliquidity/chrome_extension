// In popup.js
document.addEventListener('DOMContentLoaded', function() {
  const tickerInput = document.getElementById('ticker-input');
  const searchButton = document.getElementById('search-button');
  
  searchButton.addEventListener('click', function() {
    const ticker = tickerInput.value.trim().toUpperCase();
    if (ticker) {
      fetchTickerVideos(ticker);
    }
  });
  
  function fetchTickerVideos(ticker) {
    // Show loading indicator
    document.getElementById('videos-container').innerHTML = '<div class="loading">Loading...</div>';
    
    fetch(`https://your-python-backend.com/get_videos?ticker=${ticker}`)
      .then(response => response.json())
      .then(data => {
        displayVideos(data);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
        document.getElementById('videos-container').innerHTML = '<div class="error">Error loading videos. Please try again.</div>';
      });
  }
  
  function displayVideos(videos) {
    const container = document.getElementById('videos-container');
    container.innerHTML = '';
    
    if (videos.length === 0) {
      container.innerHTML = '<div class="no-results">No videos found for this ticker today.</div>';
      return;
    }
    
    videos.forEach(video => {
      const videoElement = document.createElement('div');
      videoElement.className = 'video-item';
      
      videoElement.innerHTML = `
        <a href="${video.url}" target="_blank">${video.title}</a>
        <div class="video-meta">${video.viewsText} • ${video.timeText}</div>
      `;
      
      container.appendChild(videoElement);
    });
  }
});