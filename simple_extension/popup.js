// Simpler popup.js for debugging
document.addEventListener('DOMContentLoaded', function() {
    // Log when popup is loaded
    console.log('Popup loaded');
    
    // Get the grab button and add a click event
    document.getElementById('grabHTML').addEventListener('click', function() {
      console.log('Grab HTML button clicked');
      
      // Get active tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log('Active tab:', tabs[0].url);
        
        // Execute script directly instead of relying on content script
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: () => {
            return document.documentElement.outerHTML;
          }
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            document.getElementById('status').textContent = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }
          
          if (results && results[0] && results[0].result) {
            const pageHTML = results[0].result;
            console.log('HTML grabbed, length:', pageHTML.length);
            document.getElementById('status').textContent = 'HTML grabbed successfully!';
            
            // Store for copy button
            window.pageHTML = pageHTML;
          } else {
            document.getElementById('status').textContent = 'Error grabbing HTML';
          }
        });
      });
    });
  
    // Copy to clipboard button
    document.getElementById('copyHTML').addEventListener('click', function() {
      console.log('Copy button clicked');
      if (window.pageHTML) {
        navigator.clipboard.writeText(window.pageHTML).then(function() {
          document.getElementById('status').textContent = 'HTML copied to clipboard!';
        }).catch(function(error) {
          console.error('Clipboard error:', error);
          document.getElementById('status').textContent = 'Error copying to clipboard';
        });
      } else {
        document.getElementById('status').textContent = 'No HTML to copy. Grab HTML first.';
      }
    });
  });