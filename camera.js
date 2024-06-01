document.addEventListener('DOMContentLoaded', async () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const snapshot = document.getElementById('snapshot');
  const countdownHeading = document.getElementById('countdownHeading');

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
      chrome.runtime.sendMessage({ action: 'photoTaken', image: dataUrl });
  }
});
