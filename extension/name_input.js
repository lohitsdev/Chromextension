document.addEventListener('DOMContentLoaded', () => {
  const videoNameInput = document.getElementById('videoName');
  const confirmNameButton = document.getElementById('confirmName');

  confirmNameButton.addEventListener('click', () => {
    const videoName = videoNameInput.value.trim();
    if (videoName) {
      // Start the recording process
      chrome.runtime.sendMessage({action: "startRecording", videoName: videoName});
      window.close();
    } else {
      alert('Please enter a video name');
    }
  });
});