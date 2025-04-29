// Elements
const codeInput    = document.getElementById('codeInput');
const previewFrame = document.getElementById('previewFrame');
const apkLink      = document.getElementById('apkLink');

// 1) Save & Load Code in LocalStorage
function saveCode() {
  localStorage.setItem('gameEngineCode', codeInput.value);
  alert('✔ Code saved!');
}

function loadCode() {
  const saved = localStorage.getItem('gameEngineCode');
  if (saved !== null) {
    codeInput.value = saved;
    alert('✔ Code loaded!');
  } else {
    alert('کوئی محفوظ کوڈ نہیں ملا');
  }
}

// 2) Generate Game (stub API call)
async function generateGame() {
  const code = codeInput.value.trim();
  if (!code) {
    return alert('پہلے اپنا کوڈ لکھیں');
  }

  // Disable button to prevent double-click
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    // فرضی API کال: یہاں اپنی /api/generate endpoint رکھیں
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await resp.json();
    // data = { previewUrl: "...", apkUrl: "..." }

    // Show live preview
    previewFrame.src = data.previewUrl;
    // Show APK link
    apkLink.href = data.apkUrl;

    alert('✔ Game generated!');
  } catch (err) {
    console.error(err);
    alert('❌ Generation failed');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Game';
  }
  }
