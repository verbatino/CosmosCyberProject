import './style.css';
import { marked } from 'marked';

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const uploadSection = document.getElementById('upload-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const reportContent = document.getElementById('report-content');
const resetBtn = document.getElementById('reset-btn');
const dangerBadge = document.getElementById('danger-badge');

let selectedFile = null;

// Configure marked to be safe
marked.setOptions({
    breaks: true,
    gfm: true
});

// Event Listeners for UI interaction
browseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
});

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
        handleFileSelect(e.dataTransfer.files[0]);
    }
});

removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    dropZone.classList.remove('hidden');
    fileInfo.classList.add('hidden');
    analyzeBtn.classList.add('hidden');
});

resetBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    resultsSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
    dropZone.classList.remove('hidden');
    fileInfo.classList.add('hidden');
    analyzeBtn.classList.add('hidden');
});

analyzeBtn.addEventListener('click', handleAnalysisRequest);

// Functions
function handleFileSelect(file) {
    // Check if it's a video
    if (!file.type.startsWith('video/')) {
        alert('Please upload a valid video file (mp4, webm, etc.)');
        return;
    }

    // Check size (e.g. max 50MB for reasonable UI)
    if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit. For hackathon demo, keep it short.');
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;

    // Update UI state
    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    analyzeBtn.classList.remove('hidden');
}

async function handleAnalysisRequest() {
    if (!selectedFile) return;

    // Transition UI to loading
    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // Assume backend is running locally on 8000
        const response = await fetch('http://localhost:8000/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        displayResults(data.assessment);

    } catch (error) {
        console.error("Analysis failed:", error);
        displayResults(`## Error analyzing video\n\nThere was an error communicating with the backend server or the NVIDIA Cosmos API.\n\n**Details:** ${error.message}`);
    }
}

function displayResults(markdownText) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    // Parse markdown into HTML
    reportContent.innerHTML = marked(markdownText);

    // Try to extract/highlight danger level if Cosmos generates it
    extractAndStyleDangerLevel(markdownText);
}

function extractAndStyleDangerLevel(text) {
    const textLower = text.toLowerCase();

    // Reset classes
    dangerBadge.className = 'danger-badge';

    if (textLower.includes('danger level: high') || textLower.includes('**high**')) {
        dangerBadge.textContent = 'High Threat';
        dangerBadge.classList.add('badge-high');
    } else if (textLower.includes('danger level: medium') || textLower.includes('**medium**')) {
        dangerBadge.textContent = 'Medium Threat';
        dangerBadge.classList.add('badge-medium');
    } else if (textLower.includes('danger level: low') || textLower.includes('**low**')) {
        dangerBadge.textContent = 'Low Threat';
        dangerBadge.classList.add('badge-low');
    } else {
        dangerBadge.textContent = 'Assessment Ready';
        dangerBadge.classList.add('badge-unknown');
    }
}
