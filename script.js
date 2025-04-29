function generateGame() {
  const code = document.getElementById('codeInput').value;
  
  // پریویو فریم کا مکمل کوڈ
  const previewHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; overflow: hidden; }
        #gameCanvas { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <canvas id="gameCanvas"></canvas>
      <script>
        // ==== Critical Fix ==== //
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        
        // گیم لوپ خودکار شروع کریں
        function startGame() {
          try {
            ${code}
            if(typeof update === 'function') {
              function gameLoop() {
                update();
                requestAnimationFrame(gameLoop);
              }
              gameLoop();
            }
          } catch(err) {
            document.body.innerHTML = '<h2 style="color:red">غلطی: ' + err.message + '</h2>';
          }
        }
        startGame();
      <\/script>
    </body>
    </html>
  `;

  document.getElementById('previewFrame').srcdoc = previewHTML;
}
