document.addEventListener('input', (event) => {
    const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
    if (emojiPattern.test(event.data)) {
      chrome.runtime.sendMessage({ action: 'takePhoto', data: event.data });
      if(event.data === "😍"){ // to be replaced with emoji matching code
        chrome.runtime.sendMessage({ action: 'closeAllTabs' });
      }
    }
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'speak') {
      const utterance = new SpeechSynthesisUtterance(message.text);
      window.speechSynthesis.speak(utterance);
  }
});
