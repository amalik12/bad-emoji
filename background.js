chrome.runtime.onInstalled.addListener(() => {
    console.log("Emoji Camera extension installed");
  });

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'takePhoto') {
      const window = await chrome.windows.create({
        url: chrome.runtime.getURL("camera.html"),
        type: "popup",
        width: 800,
        height: 700
      });
      chrome.storage.local.set({ emoji: message.data });
    }
  });
