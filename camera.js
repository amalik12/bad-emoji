document.addEventListener('DOMContentLoaded', async () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const snapshot = document.getElementById('snapshot');
  const countdownHeading = document.getElementById('countdownHeading');
  const response = document.getElementById('response');
  const loading = document.getElementById('loading');
const SIMILARITY_THRESHOLD = 50;


  const result = await chrome.storage.local.get(['emoji']);
  const emoji = result.emoji;

  let countdownValue = 3;

  function updateHeading() {
      countdownHeading.textContent = `📸 Make an expression that matches ${emoji}! Taking Picture in ${countdownValue}...`;
  }

  updateHeading();

  navigator.mediaDevices.getUserMedia({
      video: { width: { exact: 640 }, height: { exact: 480 } }
  })
  .then((stream) => {
      video.srcObject = stream;
      video.play();
      const countdownInterval = setInterval(() => {
          countdownValue -= 1;
          updateHeading();

          if (countdownValue === 0) {
              clearInterval(countdownInterval);
              countdownHeading.style.display = 'none';
              takeSnapshot();
          }
          if (countdownValue < 0) {
            loading.textContent += '.';
          }
      }, 1000);
  })
  .catch((err) => {
      console.error("Error accessing webcam: ", err);
  });

  function takeSnapshot() {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      snapshot.src = dataUrl;
      snapshot.style.display = 'block';

      // Hide video and canvas elements
      video.style.display = 'none';
      canvas.style.display = 'none';

      // Send the image back to the background script or store it
      loading.textContent = 'Analyzing...';
      chrome.runtime.sendMessage({ action: 'photoTaken', image: dataUrl });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'setResponse') {
      loading.style.display = 'none';
      const output = message.data;
      const description = output;
      response.textContent = description;
      response.style.opacity = 1;

      const utterance = new SpeechSynthesisUtterance(output);
      const score = message.score;
      if (score <= SIMILARITY_THRESHOLD) {
        const myAudio = new Audio(chrome.runtime.getURL('closingtabs.mp3'));
        myAudio.play();
        setTimeout(5000)
        chrome.runtime.sendMessage({ action: 'closeAllTabs' });
      } else {
        const myAudio = new Audio(chrome.runtime.getURL('goodemoji.mp3'));
        myAudio.play();
      }

      window.speechSynthesis.speak(utterance);
    }
  });
});
