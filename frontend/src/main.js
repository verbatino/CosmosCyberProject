import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="glass-panel">
    <header>
      <h1>Physical Threat Detector</h1>
      <p class="subtitle">Powered by NVIDIA Cosmos Reason 2</p>
    </header>

    <div class="upload-section">
      <div class="upload-zone" id="drop-zone">
        <span class="upload-icon">📹</span>
        <h3 id="file-name-display">Drag & Drop a video or Click to Browse</h3>
        <p class="subtitle">Supports MP4, MOV, WEBM (Max 50MB)</p>
        <input type="file" id="video-upload" accept="video/mp4,video/x-m4v,video/*">
      </div>
      
      <button id="analyze-btn" class="btn" disabled>Analyze Video Threat</button>
    </div>

    <div class="loader-container" id="loader">
      <div class="loader"></div>
      <p class="subtitle" id="loader-text">Analyzing physical plausibility and threat level...</p>
    </div>

    <div class="results-container" id="results">
      <h3>Analysis Report:</h3>
      <div class="results-content" id="results-content"></div>
    </div>
  </div>
`

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('video-upload');
const analyzeBtn = document.getElementById('analyze-btn');
const fileNameDisplay = document.getElementById('file-name-display');
const loader = document.getElementById('loader');
const resultsContainer = document.getElementById('results');
const resultsContent = document.getElementById('results-content');
const uploadSection = document.querySelector('.upload-section');

let selectedFile = null;

// Drag over logic
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (file.type.startsWith('video/')) {
    selectedFile = file;
    fileNameDisplay.innerHTML = `<strong>Selected:</strong> ${file.name}`;
    analyzeBtn.disabled = false;
  } else {
    alert("Please upload a valid video file.");
    fileNameDisplay.innerHTML = `Drag & Drop a video or Click to Browse`;
    selectedFile = null;
    analyzeBtn.disabled = true;
  }
}

analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  // UI state
  analyzeBtn.disabled = true;
  uploadSection.style.display = 'none';
  resultsContainer.style.display = 'none';
  loader.style.display = 'block';

  // Form Data
  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Process markdown string using marked.js
    let htmlContent = window.marked ? window.marked.parse(data.assessment) : data.assessment;

    // Add colored badges manually
    htmlContent = htmlContent.replace(/danger level\s*:\s*high/gi, '<span class="badge-high">Danger Level: High</span>');
    htmlContent = htmlContent.replace(/high/gi, '<span class="badge-high">High</span>');
    htmlContent = htmlContent.replace(/medium/gi, '<span class="badge-medium">Medium</span>');
    htmlContent = htmlContent.replace(/low/gi, '<span class="badge-low">Low</span>');

    resultsContent.innerHTML = htmlContent;

    loader.style.display = 'none';
    resultsContainer.style.display = 'block';

    // Show upload section again for another file
    setTimeout(() => {
      uploadSection.style.display = 'block';
      fileNameDisplay.innerHTML = `Drag & Drop another video or Click to Browse`;
      selectedFile = null;
    }, 2000)

  } catch (error) {
    console.error(error);
    resultsContent.innerHTML = `<p style="color:var(--danger)">Error performing analysis: ${error.message}</p>`;
    loader.style.display = 'none';
    resultsContainer.style.display = 'block';
    uploadSection.style.display = 'block';
  }
});
