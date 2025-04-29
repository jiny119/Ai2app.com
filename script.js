// --- Data ---
let objects = [], nextId = 1, selectedObject = null;
let currentProject = null;

// --- DOM Refs ---
const pmView    = document.getElementById('projectManager');
const edView    = document.getElementById('editor');
const projList  = document.getElementById('projList');
const canvas    = document.getElementById('gameCanvas');
const ctx       = canvas.getContext('2d');
const treeList  = document.getElementById('sceneTreeList');
const inspector = document.getElementById('inspectorProperties');
const modal     = document.getElementById('addNodeModal');
const typeSel   = document.getElementById('nodeTypeSelect');

// --- Init ---
window.addEventListener('load', () => {
  canvas.addEventListener('mousedown', pickObject);
  canvas.addEventListener('mousemove', dragObject);
  canvas.addEventListener('mouseup', () => selectedObject = null);
  renderProjectList();
});

// --- Project Manager ---
function renderProjectList() {
  const all = JSON.parse(localStorage.getItem('gp_list')||'[]');
  projList.innerHTML = '';
  all.forEach(name => {
    let li = document.createElement('li');
    li.textContent = name;
    li.onclick = ()=>loadProject(name);
    projList.appendChild(li);
  });
}

document.getElementById('newProjBtn').onclick = ()=>{
  let name = prompt('Project کا نام دیں:');
  if (!name) return;
  saveToList(name);
  currentProject = name;
  startEditor([]);
};

// Save project name in list
function saveToList(name) {
  let all = JSON.parse(localStorage.getItem('gp_list')||'[]');
  if (!all.includes(name)) {
    all.push(name);
    localStorage.setItem('gp_list',JSON.stringify(all));
    renderProjectList();
  }
}

// Load existing
function loadProject(name) {
  currentProject = name;
  const data = JSON.parse(localStorage.getItem('gp_'+name)||'[]');
  startEditor(data);
}

// Go back
function backToManager() {
  edView.classList.add('hidden');
  pmView.classList.remove('hidden');
}

// --- Editor Startup ---
function startEditor(data) {
  pmView.classList.add('hidden');
  edView.classList.remove('hidden');
  objects = data.length? data : [{id:1,type:'Node2D',x:0,y:0}];
  nextId = objects.reduce((m,o)=>Math.max(m,o.id),1)+1;
  updateSceneTree(); drawObjects();
  closeModal();
}

// --- Draw ---
function drawObjects(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  objects.slice(1).forEach(o=>{
    ctx.save(); ctx.translate(o.x,o.y);
    if (o.type==='Rectangle'){
      ctx.fillStyle=o.color; ctx.fillRect(-o.w/2,-o.h/2,o.w,o.h);
    }
    if (o.type==='Circle'){
      ctx.fillStyle=o.color; ctx.beginPath();
      ctx.arc(0,0,o.r,0,2*Math.PI); ctx.fill();
    }
    if (o.type==='Text'){
      ctx.fillStyle=o.color; ctx.font=o.size+'px sans-serif';
      ctx.fillText(o.text,-o.textWidth/2,o.size/2);
    }
    ctx.restore();
  });
}

// --- Scene Tree ---
function updateSceneTree(){
  treeList.innerHTML='';
  objects.forEach(o=>{
    let li=document.createElement('li');
    li.textContent = o.type + (o.id===1?' (root)':' #' + o.id);
    li.onclick = ()=>selectById(o.id);
    treeList.appendChild(li);
  });
}

// --- Select & Drag ---
function selectById(id){
  selectedObject = objects.find(o=>o.id===id);
  showInspector();
}
function pickObject(e){
  let rect=canvas.getBoundingClientRect(),
      x=e.clientX-rect.left, y=e.clientY-rect.top;
  selectedObject = objects.slice(1).find(o=>{
    if(o.type==='Rectangle')
      return x>o.x-o.w/2&&x<o.x+o.w/2&&y>o.y-o.h/2&&y<o.y+o.h/2;
    if(o.type==='Circle')
      return Math.hypot(o.x-x,o.y-y)<o.r;
    if(o.type==='Text')
      return x>o.x-o.textWidth/2&&x<o.x+o.textWidth/2&&y>o.y-o.size&&y<o.y;
  });
  showInspector();
}
function dragObject(e){
  if(!selectedObject||selectedObject.id===1)return;
  let rect=canvas.getBoundingClientRect();
  selectedObject.x=e.clientX-rect.left;
  selectedObject.y=e.clientY-rect.top;
  drawObjects();
}

// --- Inspector ---
function showInspector(){
  inspector.innerHTML='';
  if(!selectedObject)return;
  for(let key in selectedObject){
    if(['id','textWidth'].includes(key))continue;
    let inp=document.createElement('input');
    inp.value=selectedObject[key]; inp.placeholder=key;
    inp.oninput=()=>{
      let v=inp.value;
      if(key!=='type'&&key!=='text')v=parseFloat(v);
      selectedObject[key]=v;
      if(key==='text'){
        ctx.font=v+'px sans-serif';
        selectedObject.textWidth=ctx.measureText(v).width;
      }
      drawObjects();
    };
    inspector.appendChild(inp);
  }
}

// --- Modal & Add Node ---
function openModal(){ modal.classList.remove('hidden'); }
function closeModal(){ modal.classList.add('hidden'); }
function confirmAddNode(){
  let type=typeSel.value;
  let o={id:nextId++,type,x:400,y:300};
  if(type==='Rectangle'){ o.w=80;o.h=50;o.color='#ff4757'; }
  if(type==='Circle'){ o.r=30;o.color='#1e90ff'; }
  if(type==='Text'){
    o.text='Hello';o.size=20;ctx.font='20px sans-serif';
    o.textWidth=ctx.measureText(o.text).width;o.color='#333';
  }
  objects.push(o); updateSceneTree(); drawObjects(); closeModal();
}

// --- Project Actions ---
function newProject(){ startEditor([]); }
function saveProject(){
  if(!currentProject){ alert('پہلے New یا Load کریں'); return; }
  localStorage.setItem('gp_'+currentProject,JSON.stringify(objects));
  alert('✔ پروجیکٹ محفوظ ہوگیا');
}
function loadProject(){ if(currentProject) loadProject(currentProject); }
function exportProject(){
  let uri='data:text/json,'+encodeURIComponent(JSON.stringify(objects));
  let a=document.createElement('a'); a.href=uri; a.download='scene.json';
  document.body.appendChild(a); a.click(); a.remove();
                   }
