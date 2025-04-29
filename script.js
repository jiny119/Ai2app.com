// DOM Elements
const codeInput = document.getElementById('codeInput');
const previewFrame = document.getElementById('previewFrame');

// Save/Load Code
function saveCode() {
  localStorage.setItem('gameCode', codeInput.value);
  showToast('✔ کوڈ محفوظ ہو گیا', 'toast-success');
}

// Generate Game
function generateGame() {
  const code = codeInput.value;
  
  previewFrame.srcdoc = `
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="gameCanvas"></canvas>
      <script>
        // ==== Critical Fix Starts ==== //
        const localStorage = window.parent.localStorage; // Parent سے رسائی
        // ==== Critical Fix Ends ==== //
        
        // Canvas Setup
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        // User Code Execution
        try {
          ${code}
        } catch(err) {
          document.body.innerHTML = '<h2 style="color:red">Error: ' + err.message + '</h2>';
        }
      <\/script>
    </body>
    </html>
  `;
}

// Toast System
function showToast(msg, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Load Saved Code
window.addEventListener('load', () => {
  codeInput.value = localStorage.getItem('gameCode') || '';
});
