document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'photoTaken') {
        document.getElementById('snapshot').src = message.image;
      }
    });
  });
