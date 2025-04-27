// This background script can handle tasks that need to run even when the popup is closed
// For example, periodic API requests, notification handling, etc.

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed');
    
    // You can perform initial setup here
    // For example, setting default values in storage
    chrome.storage.local.set({ 
      'apiBaseUrl': 'http://solidliquidity.com',
      'requestCount': 0
    });
  });
  
  // Example of handling messages from popup or content scripts
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'makeApiRequest') {
      // Handle API request in background
      fetch(`${request.url}`, {
        method: request.method || 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: request.data ? JSON.stringify(request.data) : null
      })
      .then(response => response.json())
      .then(data => {
        // Increment request counter
        chrome.storage.local.get('requestCount', function(result) {
          const newCount = (result.requestCount || 0) + 1;
          chrome.storage.local.set({ 'requestCount': newCount });
        });
        
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        console.error('API request failed:', error);
        sendResponse({ success: false, error: error.message });
      });
      
      // Return true to indicate you wish to send a response asynchronously
      return true;
    }
  });