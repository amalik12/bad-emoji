document.addEventListener('input', (event) => {
    const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
    if (emojiPattern.test(event.data)) {
      chrome.runtime.sendMessage({ action: 'takePhoto', data: event.data});
    }
  });
