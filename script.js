// DOM Elements
const codeInput = document.getElementById('codeInput');
const previewFrame = document.getElementById('previewFrame');
const apkLink = document.getElementById('apkLink');
const languageSelector = document.getElementById('language');
const exportWebBtn = document.querySelector('.download-btn:nth-child(2)');

// 1) Save & Load Code with Language Support
function saveCode() {
    if (!codeInput.value.trim()) {
        return showToast('❌ کوڈ خالی ہے', 'error');
    }

    const codeData = {
        code: codeInput.value,
        language: languageSelector.value,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('gameEngineCode', JSON.stringify(codeData));
    showToast('✔ کوڈ محفوظ ہو گیا', 'success');
}

function loadCode() {
    const savedData = localStorage.getItem('gameEngineCode');
    if (!savedData) {
        return showToast('کوئی محفوظ کوڈ نہیں ملا', 'warning');
    }

    try {
        const { code, language } = JSON.parse(savedData);
        codeInput.value = code;
        languageSelector.value = language;
        showToast('✔ کوڈ لوڈ ہو گیا', 'success');
    } catch (err) {
        console.error('Failed to parse saved code:', err);
        showToast('کوڈ لوڈ کرنے میں خرابی', 'error');
    }
}

// 2) Enhanced Game Generation
async function generateGame() {
    const code = codeInput.value.trim();
    if (!code) {
        return showToast('پہلے اپنا کوڈ لکھیں', 'warning');
    }

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="icon">⏳</i> Generating...';

    try {
        // Show loading state in preview
        previewFrame.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #f3f4f6;
                        font-family: sans-serif;
                    }
                    .loader {
                        text-align: center;
                    }
                    .spinner {
                        border: 5px solid #e5e7eb;
                        border-top: 5px solid #3b82f6;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="loader">
                    <div class="spinner"></div>
                    <h2>گیم جنریٹ ہو رہی ہے...</h2>
                    <p>براہ کرم انتظار کریں</p>
                </div>
            </body>
            </html>
        `;

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code,
                language: languageSelector.value 
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Update preview and download links
        previewFrame.src = data.previewUrl || '';
        apkLink.href = data.apkUrl || '#';
        
        if (data.webUrl) {
            exportWebBtn.href = data.webUrl;
            exportWebBtn.style.display = 'inline-flex';
        }

        showToast('✔ گیم جنریٹ ہو گئی!', 'success');
    } catch (err) {
        console.error('Generation error:', err);
        showToast('❌ جنریشن ناکام ہوئی', 'error');
        
        // Show error in preview
        previewFrame.srcdoc = `
            <!DOCTYPE html>
            <html>
            <body style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: sans-serif;
                color: #ef4444;
                text-align: center;
            ">
                <div>
                    <h2>خرابی: گیم جنریٹ نہیں ہو سکی</h2>
                    <p>${err.message || 'نامعلوم خرابی'}</p>
                </div>
            </body>
            </html>
        `;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="icon">✨</i> Generate Game';
    }
}

// 3) Export Web Version
async function exportWeb() {
    if (!previewFrame.src && !previewFrame.srcdoc) {
        return showToast('پہلے گیم جنریٹ کریں', 'warning');
    }
    
    // Implementation for exporting web version
    showToast('ویب ورژن تیار ہو رہا ہے...', 'info');
}

// Helper Functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 4) Code Editor Enhancements
function setupCodeEditor() {
    // Auto-resize textarea
    codeInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Language-specific syntax hints
    languageSelector.addEventListener('change', function() {
        const placeholder = {
            'kotlin': 'fun main() {\n    // Your Kotlin game code\n}',
            'javascript': 'function startGame() {\n    // Your JS game code\n}',
            'nodejs': 'const game = require(\'game-module\');\n\n// Your Node.js game code'
        }[this.value];
        
        codeInput.placeholder = placeholder;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupCodeEditor();
    
    // Load any saved code on startup
    if (localStorage.getItem('gameEngineCode')) {
        loadCode();
    }
});
