// — Data & State —
let objects = [], nextId = 1, selectedObject = null;

// — DOM Refs —
const canvas      = document.getElementById('gameCanvas');
const ctx         = canvas.getContext('2d');
const treeList    = document.getElementById('sceneTreeList');
const inspector   = document.getElementById('inspectorProperties');
const modal       = document.getElementById('addNodeModal');
const typeSelect  = document.getElementById('nodeTypeSelect');

// — Initialization —
window.addEventListener('load', () => {
  canvas.addEventListener('mousedown', pickObject);
  canvas.addEventListener('mousemove', dragObject);
  canvas.addEventListener('mouseup', () => selectedObject = null);
  newProject();  // Create root on load
});

// — Draw all child objects (skip root) —
function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects.slice(1).forEach(o => {
    ctx.save(); ctx.translate(o.x, o.y);
    if (o.type === 'Rectangle') {
      ctx.fillStyle = o.color;
      ctx.fillRect(-o.w/2, -o.h/2, o.w, o.h);
    }
    if (o.type === 'Circle') {
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, 2*Math.PI);
      ctx.fill();
    }
    if (o.type === 'Text') {
      ctx.fillStyle = o.color;
      ctx.font = o.size + 'px sans-serif';
      ctx.fillText(o.text, -o.textWidth/2, o.size/2);
    }
    ctx.restore();
  });
}

// — Scene Tree UI —
function updateSceneTree() {
  treeList.innerHTML = '';
  objects.forEach(o => {
    const li = document.createElement('li');
    li.textContent = o.type + (o.id===1?' (root)':' #' + o.id);
    li.onclick = () => selectById(o.id);
    treeList.appendChild(li);
  });
}

// — Selection & Dragging —
function selectById(id) {
  selectedObject = objects.find(o => o.id === id);
  showInspector();
}
function pickObject(e) {
  const rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
  selectedObject = objects.slice(1).find(o => {
    if (o.type==='Rectangle')
      return x>o.x-o.w/2 && x<o.x+o.w/2 && y>o.y-o.h/2 && y<o.y+o.h/2;
    if (o.type==='Circle')
      return Math.hypot(o.x-x,o.y-y) < o.r;
    if (o.type==='Text')
      return x>o.x-o.textWidth/2 && x<o.x+o.textWidth/2 && y>o.y-o.size && y<o.y;
  });
  showInspector();
}
function dragObject(e) {
  if (!selectedObject || selectedObject.id===1) return;
  const rect = canvas.getBoundingClientRect();
  selectedObject.x = e.clientX - rect.left;
  selectedObject.y = e.clientY - rect.top;
  drawObjects();
}

// — Inspector Panel —
function showInspector() {
  inspector.innerHTML = '';
  if (!selectedObject) return;
  for (let key in selectedObject) {
    if (['id','textWidth'].includes(key)) continue;
    const inp = document.createElement('input');
    inp.value = selectedObject[key];
    inp.placeholder = key;
    inp.oninput = () => {
      let v = inp.value;
      if (key!=='type' && key!=='text') v = parseFloat(v);
      selectedObject[key] = v;
      if (key==='text') {
        ctx.font = v + 'px sans-serif';
        selectedObject.textWidth = ctx.measureText(v).width;
      }
      drawObjects();
    };
    inspector.appendChild(inp);
  }
}

// — Modal & Add Node —
function openModal()  { modal.style.display = 'flex'; }
function closeModal() { modal.style.display = 'none'; }
function confirmAddNode() {
  const type = typeSelect.value;
  const o = { id: nextId++, type, x:400, y:300 };
  if (type==='Rectangle') { o.w=80; o.h=50; o.color='#ff4757'; }
  if (type==='Circle')    { o.r=30; o.color='#1e90ff'; }
  if (type==='Text') {
    o.text='Hello'; o.size=20;
    ctx.font='20px sans-serif';
    o.textWidth = ctx.measureText(o.text).width;
    o.color='#333';
  }
  objects.push(o);
  updateSceneTree();
  drawObjects();
  closeModal();
}

// — Project Actions (LocalStorage) —
function newProject() {
  objects = [{ id:1, type:'Node2D', x:0, y:0 }];
  nextId = 2;
  updateSceneTree();
  drawObjects();
  closeModal();
}
function saveProject() {
  localStorage.setItem('my2DEngine', JSON.stringify(objects));
  alert('✔ Saved!');
}
function loadProject() {
  const data = JSON.parse(localStorage.getItem('my2DEngine') || '[]');
  if (data.length) {
    objects = data;
    nextId = Math.max(...objects.map(o=>o.id)) + 1;
    updateSceneTree();
    drawObjects();
    alert('✔ Loaded!');
  }
}
function exportProject() {
  const uri = 'data:text/json,' + encodeURIComponent(JSON.stringify(objects));
  const a = document.createElement('a');
  a.href = uri; a.download = 'scene.json';
  document.body.appendChild(a);
  a.click(); a.remove();
  }
