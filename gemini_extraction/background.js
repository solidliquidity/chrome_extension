// Stock Trends Analyzer - Background Script
const API_URL = "http://127.0.0.1:8080"; // Local development URL
let cachedData = null;

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractStocks") {
    fetch(`${API_URL}/get_stocks_from_html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html: request.html })
    })
    .then(response => response.json())
    .then(data => {
      cachedData = data;
      sendResponse({success: true, data: data});
      
      // Store data in chrome storage for persistence
      chrome.storage.local.set({stockData: data});
      
      // Create notification if tickers were found
      if (data.tickers && data.tickers.length > 0) {
        chrome.runtime.sendMessage({
          action: "showNotification", 
          count: data.tickers.length
        });
      }
    })
    .catch(error => {
      console.error("Error extracting stocks:", error);
      sendResponse({success: false, error: error.message});
    });
    return true; // Keep the message channel open for the async response
  }
  
  if (request.action === "getCachedData") {
    if (cachedData) {
      sendResponse({data: cachedData});
    } else {
      chrome.storage.local.get(['stockData'], function(result) {
        sendResponse({data: result.stockData || null});
      });
    }
    return true;
  }
});

console.log("Stock Trends Analyzer background script loaded");