const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('video'), (req, res) => {
  console.log("Received upload request");
  
  if (!req.file) {
    console.error("No file received");
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  console.log("File received:", req.file);

  const newFilename = req.file.originalname; // Use the original filename
  const newPath = path.join('uploads', newFilename);
  
  try {
    fs.renameSync(req.file.path, newPath);
    console.log("File renamed and moved to:", newPath);

    res.json({ 
      success: true, 
      message: 'File uploaded successfully', 
      filename: newFilename,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ success: false, message: 'Error processing uploaded file.' });
  }
});

app.get('/videos', (req, res) => {
  const videos = fs.readdirSync('uploads').filter(file => file.endsWith('.webm'));
  res.json(videos);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});