function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    console.log('Recording stopped');
    stopButton.disabled = true;
    startButton.disabled = false;
    
    // Remove the prompt to save the file
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      sendBlobToServer(blob);
      recordedChunks = [];
    };
  }
}

// New function to send blob to server
function sendBlobToServer(blob) {
  const formData = new FormData();
  formData.append('video', blob, `video${Date.now()}.webm`);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('Video uploaded successfully:', data);
    // You can add code here to notify the user that the upload is complete
    // For example:
    alert('Video uploaded successfully. Check the Analytics page to view it.');
  })
  .catch(error => {
    console.error('Error uploading video:', error);
    alert('Error uploading video. Please try again.');
  });
}

// Make sure to declare this variable at the top of your script
let recordedChunks = [];

// Modify your startRecording function to initialize recordedChunks
function startRecording() {
  // ... existing code ...

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  // ... rest of the existing code ...
}