// DOM Elements
const codeInput = document.getElementById('codeInput');
const previewFrame = document.getElementById('previewFrame');

// Local Storage Functions
function saveCode() {
  if (!codeInput.value.trim()) {
    showToast('❌ کوڈ خالی ہے', 'error');
    return;
  }
  localStorage.setItem('gameCode', codeInput.value);
  showToast('✔ کوڈ محفوظ ہو گیا', 'success');
}

function loadCode() {
  const savedCode = localStorage.getItem('gameCode');
  if (savedCode) {
    codeInput.value = savedCode;
    showToast('✔ کوڈ لوڈ ہو گیا', 'success');
  }
}

// Game Generation with Fixes
function generateGame(event) {
  const code = codeInput.value.trim();
  if (!code) {
    showToast('⚠ پہلے کوڈ لکھیں', 'warning');
    return;
  }

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
        // Sandbox Fix
        const localStorage = window.parent.localStorage;
        
        // Canvas Setup
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;  // Fixed width
        canvas.height = 600; // Fixed height

        // Game Loop Example
        let x = 300, y = 300;
        
        function update() {
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(x, y, 50, 50);
          
          requestAnimationFrame(update);
        }
        
        // User Code Execution
        try {
          ${code}
          update(); // Auto-start game loop
        } catch (err) {
          document.body.innerHTML = '<h2 style="color:red">غلطی: ' + err.message + '</h2>';
        }
      <\/script>
    </body>
    </html>
  `;
}

// APK Export (Improved)
function exportAPK() {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body>
        <script>${codeInput.value}<\/script>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game_${Date.now()}.html`;
    a.click();
    showToast('✔ فائل ڈاؤن لوڈ ہو گئی', 'success');
  } catch (err) {
    showToast('❌ ڈاؤن لوڈ ناکام: ' + err.message, 'error');
  }
}

// Toast Notification System
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  loadCode();
  codeInput.addEventListener('input', () => {
    codeInput.style.height = 'auto';
    codeInput.style.height = codeInput.scrollHeight + 'px';
  });
});
