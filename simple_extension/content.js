// This script runs in the context of the web page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getPageHTML") {
      sendResponse({html: document.documentElement.outerHTML});
    }
  });