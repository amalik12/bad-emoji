chrome.runtime.onInstalled.addListener(() => {
    console.log("Emoji Camera extension installed");
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'takePhoto') {
      chrome.windows.create({
        url: chrome.runtime.getURL("camera.html"),
        type: "popup",
        width: 800,
        height: 700
      });
    }
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'closeAllTabs') {
          chrome.tabs.query({}, function(tabs) {
              for (let i = 0; i < tabs.length; i++) {
                  chrome.tabs.remove(tabs[i].id);
              }
          });
      }
  });
  
  });
