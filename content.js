document.addEventListener('input', (event) => {
    const emojiPattern = /[\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u1F700-\u1F77F\u2600-\u26FF\u2700-\u27BF]/;
    if (emojiPattern.test(event.target.value)) {
      chrome.runtime.sendMessage({ action: 'takePhoto' });
    }
  });
