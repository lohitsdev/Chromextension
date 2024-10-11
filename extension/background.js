let recordedChunks = [];

function injectContentScriptIfNeeded(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, {action: "ping"}, response => {
      if (chrome.runtime.lastError) {
        // Content script is not loaded, inject it
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      chrome.desktopCapture.chooseDesktopMedia(
        ["screen", "window", "tab"],
        tab,
        (streamId) => {
          if (streamId) {
            injectContentScriptIfNeeded(tab.id)
              .then(() => {
                chrome.tabs.sendMessage(tab.id, {
                  action: "getStream", 
                  streamId: streamId
                }, response => {
                  if (chrome.runtime.lastError) {
                    console.error("Error sending message to content script:", chrome.runtime.lastError);
                    sendResponse({success: false, error: chrome.runtime.lastError.message});
                  } else {
                    sendResponse({success: true});
                  }
                });
              })
              .catch(error => {
                console.error("Error injecting content script:", error);
                sendResponse({success: false, error: error.message});
              });
          } else {
            sendResponse({success: false, error: "Failed to get stream ID"});
          }
        }
      );
    });
    return true; // Indicates that the response is sent asynchronously
  } else if (message.action === "uploadSuccess" || message.action === "uploadError") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message);
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Screen Recorder extension installed');
});