// Local Storage سے کوڈ محفوظ/لوڈ کریں
function saveCode() {
  const code = document.getElementById('codeInput').value;
  localStorage.setItem('gameCode', code);
  alert('کوڈ محفوظ ہو گیا!');
}

// گیم جنریٹ کریں
function generateGame(event) {
  const code = document.getElementById('codeInput').value;
  const iframe = document.getElementById('previewFrame');
  
  iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="gameCanvas"></canvas>
      <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Local Storage فنکشنز
        const loadData = (key) => JSON.parse(localStorage.getItem(key));
        const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));

        try {
          ${code}
        } catch (err) {
          document.body.innerHTML = '<h2 style="color:red">غلطی: ' + err.message + '</h2>';
        }
      <\/script>
    </body>
    </html>
  `;
}

// APK ڈاؤن لوڈ (Mockup)
function exportAPK() {
  const blob = new Blob(['مثال کے طور پر APK مواد'], { type: 'application/vnd.android.package-archive' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'game.apk';
  a.click();
}

// ابتدائی لوڈ
document.addEventListener('DOMContentLoaded', () => {
  const savedCode = localStorage.getItem('gameCode');
  if (savedCode) document.getElementById('codeInput').value = savedCode;
});
