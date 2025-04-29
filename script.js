// DOM Elements
const codeInput = document.getElementById('codeInput');
const previewFrame = document.getElementById('previewFrame');
const apkLink = document.getElementById('apkLink');
const languageSelector = document.getElementById('language');

// 1. Save/Load Code with Local Storage
function saveCode() {
  if (!codeInput.value.trim()) return showToast('❌ کوڈ خالی ہے', 'error');
  
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
    codeInput.dispatchEvent(new Event('input'));
    showToast('✔ کوڈ لوڈ ہو گیا', 'success');
  } catch (err) {
    showToast('کوڈ لوڈ کرنے میں خرابی', 'error');
  }
}

// 2. Game Generation & Preview
async function generateGame(event) {
  const code = codeInput.value.trim();
  if (!code) return showToast('پہلے کوڈ لکھیں', 'warning');
  
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="icon">⏳</i> جنریٹ ہو رہا ہے...';

  try {
    previewFrame.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; overflow: hidden; }
          #gameCanvas { background: #1a1a1a; }
        </style>
      </head>
      <body>
        <canvas id="gameCanvas"></canvas>
        <script>
          const canvas = document.getElementById("gameCanvas");
          const ctx = canvas.getContext("2d");
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          
          try {
            ${code}
          } catch (err) {
            document.body.innerHTML = '<div class="game-error">غلطی: ' + err.message + '</div>';
          }
        <\/script>
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

// 3. Export Functions
async function exportWeb() {
  const code = codeInput.value.trim();
  if (!code) return showToast('پہلے کوڈ لکھیں', 'warning');
  
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>body { margin: 0; }</style>
      </head>
      <body>
        <canvas id="gameCanvas"></canvas>
        <script>
          const canvas = document.getElementById("gameCanvas");
          const ctx = canvas.getContext("2d");
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          ${code}
        <\/script>
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

// 4. Helper Functions
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

// 5. Code Editor Setup
function setupCodeEditor() {
  codeInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  languageSelector.addEventListener('change', function() {
    const placeholders = {
      'kotlin': 'fun main() {\n    // کوٹلن کوڈ یہاں لکھیں\n}',
      'javascript': 'function update() {\n    // گیم لوپ یہاں لکھیں\n}',
      'nodejs': 'const game = require(\'game\');\n\n// نوڈ جے ایس کوڈ'
    };
    codeInput.placeholder = placeholders[this.value] || 'اپنا کوڈ یہاں لکھیں...';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupCodeEditor();
  loadCode();
});
