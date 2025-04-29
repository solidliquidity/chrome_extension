// Stock Trends Analyzer - Content Script

// Function to check if the current page is a financial article
function isFinancialArticle() {
  const articleText = document.body.innerText;
  
  // Keywords that might indicate a financial article
  const financialKeywords = [
    'stock', 'market', 'shares', 'investor', 'financial', 'invest', 
    'nasdaq', 'nyse', 'ftse', 'trading', 'earnings'
  ];
  
  // Check if the article contains at least 3 financial keywords
  let keywordCount = 0;
  let foundKeywords = [];
  
  for (const keyword of financialKeywords) {
    if (articleText.toLowerCase().includes(keyword.toLowerCase())) {
      keywordCount++;
      foundKeywords.push(keyword);
    }
  }
  
  console.log(`Found ${keywordCount} financial keywords: ${foundKeywords.join(', ')}`);
  return keywordCount >= 3;
}

// Function to extract stocks from the page
function extractStocksFromPage() {
  console.log("Checking if page is a financial article...");
  if (!isFinancialArticle()) {
    console.log("Not a financial article, skipping analysis");
    return;
  }
  
  console.log("Financial article detected, analyzing...");
  
  // Get the HTML content of the page
  const htmlContent = document.documentElement.outerHTML;
  console.log("HTML content length:", htmlContent.length);
  
  // Send the HTML to the background script for processing
  console.log("Sending message to background script...");
  chrome.runtime.sendMessage(
    { action: "extractStocks", html: htmlContent },
    (response) => {
      console.log("Received response from background script:", response);
      if (response && response.success) {
        console.log("Extracted stocks:", response.data?.tickers);
        console.log("Full response data:", JSON.stringify(response.data, null, 2));
      } else {
        console.error("Error extracting stocks:", response?.error);
      }
    }
  );
}

// Function to show a notification when stocks are found
function showStockNotification(count) {
  // Check if notification already exists
  if (document.getElementById('stock-notification')) {
    return;
  }
  
  // Create a floating notification
  const notification = document.createElement('div');
  notification.id = 'stock-notification';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#f8f9fa';
  notification.style.border = '1px solid #dee2e6';
  notification.style.borderRadius = '4px';
  notification.style.padding = '10px';
  notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  notification.style.zIndex = '9999';
  notification.style.maxWidth = '300px';
  
  // Create notification content
  notification.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <strong>Stocks Found</strong>
      <span style="cursor: pointer;" id="stock-notification-close">&times;</span>
    </div>
    <div>
      ${count} stock${count !== 1 ? 's' : ''} mentioned in this article. 
      <span style="color: #0066cc;">Click the extension icon in the toolbar to view the analysis.</span>
    </div>
  `;
  
  // Append the notification to the body
  document.body.appendChild(notification);
  
  // Add event listener to close the notification
  document.getElementById('stock-notification-close').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-remove the notification after 15 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 15000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNotification") {
    showStockNotification(request.count);
  } else if (request.action === "forceExtraction") {
    console.log("Force extraction requested");
    // Get the HTML content of the page
    const htmlContent = document.documentElement.outerHTML;
    
    // Send the HTML to the background script for processing
    chrome.runtime.sendMessage(
      { action: "extractStocks", html: htmlContent },
      (response) => {
        console.log("Force extraction response:", response);
      }
    );
  }
});

// Wait for the page to fully load before extracting stocks
window.addEventListener('load', () => {
  console.log("Page loaded, waiting briefly before analyzing...");
  // Wait a moment to ensure all content is rendered
  setTimeout(extractStocksFromPage, 1500);
});

console.log("Stock Trends Analyzer content script loaded");