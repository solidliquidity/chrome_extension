// Stock Trends Analyzer - Background Script
const API_URL = "http://127.0.0.1:8080"; // Local development URL
let cachedData = null;

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractStocks") {
    console.log("Extracting stocks from HTML...");
    
    fetch(`${API_URL}/get_tickers_from_html_spacy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html: request.html })
    })
    .then(response => {
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get('Content-Type')}`);
      // Get the raw text first to debug any JSON parsing issues
      return response.text();
    })
    .then(text => {
      // Log the raw response for debugging
      console.log("Raw API response:", text.substring(0, 200) + "...");
      
      try {
        // Try to parse the text as JSON
        const data = JSON.parse(text);
        
        // Log the complete parsed data structure
        console.log("Parsed API response:", data);
        console.log("Response has tickers?", !!data.tickers);
        console.log("Response has plot_data?", !!data.plot_data);
        
        // Store the data
        cachedData = data;
        sendResponse({success: true, data: data});
        
        // Store data in chrome storage for persistence
        chrome.storage.local.set({stockData: data});
        
        // Create notification if tickers were found
        if (data.tickers && data.tickers.length > 0 && sender && sender.tab) {
          console.log(`Sending notification for ${data.tickers.length} stocks to tab ${sender.tab.id}`);
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showNotification", 
            count: data.tickers.length
          });
        } else {
          console.log("No tickers found or no valid tab to notify");
          console.log("Tickers:", data.tickers);
          console.log("Sender tab:", sender?.tab?.id);
        }
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        sendResponse({
          success: false, 
          error: "Invalid response from server: " + jsonError.message, 
          rawResponse: text.substring(0, 500)
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
    console.log("Getting cached data...");
    if (cachedData) {
      console.log("Returning data from memory cache");
      sendResponse({data: cachedData});
    } else {
      console.log("Checking Chrome storage for cached data");
      chrome.storage.local.get(['stockData'], function(result) {
        if (result.stockData) {
          console.log("Found data in Chrome storage");
        } else {
          console.log("No data found in Chrome storage");
        }
        sendResponse({data: result.stockData || null});
      });
    }
    return true;
  }
});

console.log("Stock Trends Analyzer background script loaded");