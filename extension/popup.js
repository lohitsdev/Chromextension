let isRecording = false;

document.addEventListener('DOMContentLoaded', () => {
  const recordButton = document.getElementById('recordButton');
  const status = document.getElementById('status');

  recordButton.addEventListener('click', () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });

  function startRecording() {
    chrome.runtime.sendMessage({action: "startRecording"}, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = "Failed to start recording: " + chrome.runtime.lastError.message;
      } else {
        isRecording = true;
        recordButton.innerHTML = '<i class="fas fa-stop-circle"></i><span>Stop Rec</span>';
        recordButton.classList.add('recording');
        status.textContent = "Recording...";
      }
    });
  }

  function stopRecording() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "stopRecording"}, (response) => {
        if (chrome.runtime.lastError) {
          status.textContent = "Failed to stop recording: " + chrome.runtime.lastError.message;
        } else {
          isRecording = false;
          recordButton.innerHTML = '<i class="fas fa-record-vinyl"></i><span>Start Rec</span>';
          recordButton.classList.remove('recording');
          status.textContent = "Recording stopped. Uploading...";
        }
      });
    });
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "uploadSuccess") {
      status.textContent = `Video uploaded successfully. Size: ${(request.data.fileSize / 1024 / 1024).toFixed(2)} MB`;
    } else if (request.action === "uploadError") {
      status.textContent = "Error uploading video: " + request.error;
    }
  });
});