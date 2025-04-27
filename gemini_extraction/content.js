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
  for (const keyword of financialKeywords) {
    if (articleText.toLowerCase().includes(keyword.toLowerCase())) {
      keywordCount++;
    }
  }
  
  return keywordCount >= 3;
}

// Function to extract stocks from the page
function extractStocksFromPage() {
  if (!isFinancialArticle()) {
    console.log("Not a financial article, skipping analysis");
    return;
  }
  
  console.log("Financial article detected, analyzing...");
  
  // Get the HTML content of the page
  const htmlContent = document.documentElement.outerHTML;
  
  // Send the HTML to the background script for processing
  chrome.runtime.sendMessage(
    { action: "extractStocks", html: htmlContent },
    (response) => {
      if (response && response.success) {
        console.log("Extracted stocks:", response.data.tickers);
      } else {
        console.error("Error extracting stocks:", response?.error);
      }
    }
  );
}

// Function to show a notification when stocks are found
function showStockNotification(count) {
  // Create a floating notification
  const notification = document.createElement('div');
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
      ${count} stocks mentioned in this article. 
      <a href="#" id="stock-notification-view">View analysis</a>
    </div>
  `;
  
  // Append the notification to the body
  document.body.appendChild(notification);
  
  // Add event listener to close the notification
  document.getElementById('stock-notification-close').addEventListener('click', () => {
    notification.remove();
  });
  
  // Add event listener to open the popup
  document.getElementById('stock-notification-view').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: "openPopup" });
  });
  
  // Auto-remove the notification after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNotification") {
    showStockNotification(request.count);
  }
});

// Wait for the page to fully load before extracting stocks
window.addEventListener('load', () => {
  // Wait a moment to ensure all content is rendered
  setTimeout(extractStocksFromPage, 1500);
});