chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({status: "ok"});
  }
});

let recordedChunks = [];

function stopRecording() {
  if (window.mediaRecorder && window.mediaRecorder.state !== "inactive") {
    window.mediaRecorder.stop();
    console.log("Recording stopped");
  }
}

function uploadVideo(blob) {
  const formData = new FormData();
  formData.append('video', blob, `recording_${Date.now()}.webm`);

  fetch('http://localhost:5000/upload/', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Video uploaded successfully:', data);
    chrome.runtime.sendMessage({action: "uploadSuccess", data: data});
  })
  .catch(error => {
    console.error('Error uploading video:', error);
    chrome.runtime.sendMessage({action: "uploadError", error: error.message});
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkContentScriptLoaded") {
    sendResponse({loaded: true});
  } else if (request.action === "getStream") {
    navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: request.streamId
        }
      }
    }).then((stream) => {
      window.mediaRecorder = new MediaRecorder(stream);
      
      window.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      window.mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped");
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(recordedChunks, {type: 'video/webm'});
        uploadVideo(blob);
        recordedChunks = [];
      };

      window.mediaRecorder.start();
      chrome.runtime.sendMessage({action: "recordingStarted"});
      sendResponse({success: true});
    }).catch((error) => {
      sendResponse({success: false, error: error.message});
    });
    return true;
  } else if (request.action === "stopRecording") {
    stopRecording();
    sendResponse({success: true});
  }
});