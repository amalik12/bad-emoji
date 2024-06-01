document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const snapshot = document.getElementById('snapshot');

  navigator.mediaDevices.getUserMedia({
    video: { width: { exact: 680 }, height: { exact: 480 } }
  })
      .then((stream) => {
        video.srcObject = stream;
        video.play();

        setTimeout(() => {
          const context = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          snapshot.src = dataUrl;

          // Stop the video stream
          stream.getTracks().forEach(track => track.stop());

          // Send the image back to the background script or store it
          chrome.runtime.sendMessage({ action: 'photoTaken', image: dataUrl });
        }, 3000); // 3000 milliseconds = 3 seconds
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
  });
