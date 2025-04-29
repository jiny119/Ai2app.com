// -- Data & IDs --
let objects = [];
let nextId = 1;
let selectedObject = null;

const canvas      = document.getElementById('gameCanvas');
const ctx         = canvas.getContext('2d');
const treeList    = document.getElementById('sceneTreeList');
const inspector   = document.getElementById('inspectorProperties');
const modal       = document.getElementById('addNodeModal');
const typeSelect  = document.getElementById('nodeTypeSelect');

// -- Init on load --
window.addEventListener('load', () => {
  newProject();
  canvas.addEventListener('mousedown', pickObject);
  canvas.addEventListener('mousemove', dragObject);
  canvas.addEventListener('mouseup', () => selectedObject = null);
});

// -- DRAW ALL OBJECTS --
function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects.forEach(o => {
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.type === 'rectangle') {
      ctx.fillStyle = o.color; ctx.fillRect(-o.w/2, -o.h/2, o.w, o.h);
    }
    if (o.type === 'circle') {
      ctx.fillStyle = o.color; ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, 2*Math.PI); ctx.fill();
    }
    if (o.type === 'text') {
      ctx.fillStyle = o.color; ctx.font = o.size + 'px sans-serif';
      ctx.fillText(o.text, -o.textWidth/2, o.size/2);
    }
    ctx.restore();
  });
}

// -- SCENE TREE UI --
function updateSceneTree() {
  treeList.innerHTML = '';
  objects.forEach(o => {
    const li = document.createElement('li');
    li.textContent = `${o.type} #${o.id}`;
    li.onclick = () => selectObjectById(o.id);
    treeList.appendChild(li);
  });
}

// -- SELECT & INSPECT --
function selectObjectById(id) {
  selectedObject = objects.find(o => o.id === id);
  showInspector();
}
function pickObject(e) {
  const rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
  selectedObject = objects.find(o => {
    if (o.type === 'rectangle')
      return x > o.x - o.w/2 && x < o.x + o.w/2 &&
             y > o.y - o.h/2 && y < o.y + o.h/2;
    if (o.type === 'circle')
      return Math.hypot(o.x - x, o.y - y) < o.r;
    if (o.type === 'text')
      return x > o.x - o.textWidth/2 && x < o.x + o.textWidth/2 &&
             y > o.y - o.size && y < o.y + 4;
  });
  showInspector();
}
function dragObject(e) {
  if (!selectedObject) return;
  const rect = canvas.getBoundingClientRect();
  selectedObject.x = e.clientX - rect.left;
  selectedObject.y = e.clientY - rect.top;
  drawObjects();
}

// -- INSPECTOR PANEL --
function showInspector() {
  inspector.innerHTML = '';
  if (!selectedObject) return;
  for (let key in selectedObject) {
    if (['id','textWidth'].includes(key)) continue;
    const input = document.createElement('input');
    input.value = selectedObject[key];
    input.placeholder = key;
    input.oninput = () => {
      let val = input.value;
      if (key !== 'type' && key !== 'text') val = parseFloat(val);
      selectedObject[key] = val;
      if (key === 'text') selectedObject.textWidth = ctx.measureText(val).width;
      drawObjects();
    };
    inspector.appendChild(input);
  }
}

// -- ADD NODE MODAL --
function openModal() { modal.style.display = 'flex'; }
function closeModal() { modal.style.display = 'none'; }
function confirmAddNode() {
  const type = typeSelect.value;
  const o = { id: nextId++, type, x:400, y:300 };
  if (type === 'rectangle') { o.w=100; o.h=60; o.color='#ff4757' }
  if (type === 'circle')    { o.r=40; o.color='#1e90ff'  }
  if (type === 'text')      { o.text='Hello'; o.size=24;
                             ctx.font='24px sans-serif';
                             o.textWidth = ctx.measureText(o.text).width;
                             o.color='#333' }
  objects.push(o);
  updateSceneTree();
  drawObjects();
  closeModal();
}

// -- PROJECT LIFECYCLE --
function newProject() {
  objects = []; nextId = 1;
  updateSceneTree();
  drawObjects();
  closeModal();
}
function saveProject() {
  localStorage.setItem('my2DEngine', JSON.stringify(objects));
  alert('✔ Project saved locally');
}
function loadProject() {
  const data = JSON.parse(localStorage.getItem('my2DEngine') || '[]');
  objects = data;
  nextId = objects.reduce((m,o)=>Math.max(m,o.id),0) + 1;
  updateSceneTree();
  drawObjects();
  alert('✔ Project loaded');
}
function exportProject() {
  const str = "data:text/json," + encodeURIComponent(JSON.stringify(objects));
  const a = document.createElement('a');
  a.href = str; a.download = 'scene.json';
  document.body.appendChild(a); a.click(); a.remove();
                }
