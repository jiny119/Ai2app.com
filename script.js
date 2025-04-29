// DOM Elements
const codeInput = document.getElementById('codeInput');
const previewFrame = document.getElementById('previewFrame');
const apkLink = document.getElementById('apkLink');
const languageSelector = document.getElementById('language');

// 1) Save & Load Code with Local Storage
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
    if (!savedData) return showToast('کوئی محفوظ کوڈ نہیں ملا', 'warning');

    try {
        const { code, language } = JSON.parse(savedData);
        codeInput.value = code;
        languageSelector.value = language;
        codeInput.dispatchEvent(new Event('input')); // Auto-resize
        showToast('✔ کوڈ لوڈ ہو گیا', 'success');
    } catch (err) {
        showToast('کوڈ لوڈ کرنے میں خرابی', 'error');
    }
}

// 2) Local Game Generation (بغیر API کے)
async function generateGame(event) {
    const code = codeInput.value.trim();
    if (!code) return showToast('پہلے کوڈ لکھیں', 'warning');

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="icon">⏳</i> جنریٹ ہو رہا ہے...';

    try {
        // Local Preview بنائیں
        previewFrame.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>گیم پریویو</title>
                <style>
                    body { 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #1a1a1a;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <h1>گیم چل رہی ہے! 🎮</h1>
                <script>${code}<\/script>
            </body>
            </html>
        `;

        showToast('✔ گیم تیار ہو گئی!', 'success');
    } catch (err) {
        showToast('❌ جنریشن ناکام: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="icon">✨</i> گیم بنائیں';
    }
}

// 3) Export Web Version
async function exportWeb() {
    const code = codeInput.value.trim();
    if (!code) return showToast('پہلے کوڈ لکھیں', 'warning');

    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>آپ کی گیم</title>
                <style>
                    body { 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #1a1a1a;
                        color: white;
                    }
                </style>
            </head>
            <body>
                <h1>خوش آمدید! 🚀</h1>
                <script>${code}<\/script>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `game_${Date.now()}.html`;
        a.click();
        
        showToast('✔ HTML فائل ڈاؤن لوڈ ہو گئی', 'success');
    } catch (err) {
        showToast('❌ ڈاؤن لوڈ ناکام', 'error');
    }
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
        this.style.height = this.scrollHeight + 'px';
    });

    // Language-specific placeholders
    languageSelector.addEventListener('change', function() {
        const placeholders = {
            'kotlin': 'fun main() {\n    // کوٹلن کوڈ یہاں لکھیں\n}',
            'javascript': 'function startGame() {\n    // جاوا اسکرپٹ کوڈ یہاں لکھیں\n}',
            'nodejs': 'const game = require(\'game\');\n\n// نوڈ جے ایس کوڈ یہاں لکھیں'
        };
        codeInput.placeholder = placeholders[this.value] || 'اپنا کوڈ یہاں لکھیں...';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupCodeEditor();
    if (localStorage.getItem('gameEngineCode')) loadCode();
});
