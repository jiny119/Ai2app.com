// Data
let objects = [];
let nextId = 1;
let selectedObject = null;

// DOM Refs
const canvas     = document.getElementById('gameCanvas');
const ctx        = canvas.getContext('2d');
const treeList   = document.getElementById('sceneTreeList');
const inspector  = document.getElementById('inspectorProperties');
const modal      = document.getElementById('addNodeModal');
const typeSelect = document.getElementById('nodeTypeSelect');

// Init
window.addEventListener('load', () => {
  canvas.addEventListener('mousedown', pickObject);
  canvas.addEventListener('mousemove', dragObject);
  canvas.addEventListener('mouseup', () => selectedObject = null);
  newProject();   // auto-create root on load
});

// DRAW
function drawObjects() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Skip the root (id=1, type=Node2D), only draw shapes/text
  objects.slice(1).forEach(o => {
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.type === 'rectangle') {
      ctx.fillStyle = o.color;
      ctx.fillRect(-o.w/2, -o.h/2, o.w, o.h);
    }
    if (o.type === 'circle') {
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, 2*Math.PI);
      ctx.fill();
    }
    if (o.type === 'text') {
      ctx.fillStyle = o.color;
      ctx.font = o.size + 'px sans-serif';
      ctx.fillText(o.text, -o.textWidth/2, o.size/2);
    }
    ctx.restore();
  });
}

// TREE
function updateSceneTree() {
  treeList.innerHTML = '';
  objects.forEach(o => {
    const li = document.createElement('li');
    li.textContent = `${o.type}${o.id===1?' (root)':' #' + o.id}`;
    li.onclick = () => selectObjectById(o.id);
    treeList.appendChild(li);
  });
}

// SELECTION & DRAG
function selectObjectById(id) {
  selectedObject = objects.find(o => o.id === id);
  showInspector();
}
function pickObject(e) {
  const { left, top } = canvas.getBoundingClientRect();
  const x = e.clientX - left, y = e.clientY - top;
  // only non-root nodes
  selectedObject = objects.slice(1).find(o => {
    if (o.type==='rectangle')
      return x>o.x-o.w/2 && x<o.x+o.w/2 && y>o.y-o.h/2 && y<o.y+o.h/2;
    if (o.type==='circle')
      return Math.hypot(o.x-x,o.y-y)<o.r;
    if (o.type==='text')
      return x>o.x-o.textWidth/2 && x<o.x+o.textWidth/2 &&
             y>o.y-o.size && y<o.y;
  });
  showInspector();
}
function dragObject(e) {
  if (!selectedObject || selectedObject.id===1) return;
  const { left, top } = canvas.getBoundingClientRect();
  selectedObject.x = e.clientX - left;
  selectedObject.y = e.clientY - top;
  drawObjects();
}

// INSPECTOR
function showInspector() {
  inspector.innerHTML = '';
  if (!selectedObject) return;
  Object.keys(selectedObject).forEach(key => {
    if (['id','textWidth'].includes(key)) return;
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
  });
}

// MODAL
function openModal()  { modal.style.display = 'flex'; }
function closeModal() { modal.style.display = 'none'; }
function confirmAddNode() {
  const type = typeSelect.value;
  // always children of root, so x/y relative to center
  const o = { id: nextId++, type, x:400, y:300 };
  if (type==='Rectangle') {
    o.w=100; o.h=60; o.color='#ff4757';
  }
  if (type==='Circle') {
    o.r=40; o.color='#1e90ff';
  }
  if (type==='Text') {
    o.text='Hello'; o.size=24;
    ctx.font = '24px sans-serif';
    o.textWidth = ctx.measureText(o.text).width;
    o.color='#333';
  }
  objects.push(o);
  updateSceneTree();
  drawObjects();
  closeModal();
}

// PROJECT
function newProject() {
  objects = [{
    id:1,      // root node
    type:'Node2D',
    x:0, y:0
  }];
  nextId = 2;
  updateSceneTree();
  drawObjects();
  closeModal();
}
function saveProject() {
  localStorage.setItem('godot2d', JSON.stringify(objects));
  alert('✔ Project saved locally');
}
function loadProject() {
  const data = JSON.parse(localStorage.getItem('godot2d') || '[]');
  if (data.length) {
    objects = data;
    nextId = Math.max(...objects.map(o=>o.id))+1;
    updateSceneTree();
    drawObjects();
    alert('✔ Project loaded');
  }
}
function exportProject() {
  const uri = 'data:text/json,' + encodeURIComponent(JSON.stringify(objects));
  const a = document.createElement('a');
  a.href = uri; a.download = 'scene.json';
  document.body.appendChild(a);
  a.click(); a.remove();
    }
