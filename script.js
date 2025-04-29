let objects = [];
let selectedObject = null;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.addEventListener('mousedown', selectObject);
canvas.addEventListener('mousemove', moveObject);
canvas.addEventListener('mouseup', () => selectedObject = null);

// Drawing objects on canvas
function drawObjects() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation || 0);
        if (obj.type === 'rectangle') {
            ctx.fillStyle = obj.color;
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
        } else if (obj.type === 'circle') {
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'text') {
            ctx.fillStyle = obj.color;
            ctx.font = `${obj.size}px Arial`;
            ctx.fillText(obj.text, -obj.width/2, obj.height/2);
        } else if (obj.type === 'image' && obj.img) {
            ctx.drawImage(obj.img, -obj.width/2, -obj.height/2, obj.width, obj.height);
        }
        ctx.restore();
    });
}

// Add Rectangle, Circle, Text etc.
function addNode() {
    document.getElementById('addNodeModal').style.display = 'flex';
}

function confirmAddNode() {
    const type = document.getElementById('nodeTypeSelect').value;
    if (type === 'Node2D') {
        objects.push({ type: 'rectangle', x: 400, y: 300, width: 100, height: 100, color: '#ff4757' });
    } else if (type === 'Sprite') {
        // Similar logic for Sprite and others...
    }
    drawObjects();
    closeModal();
}

function closeModal() {
    document.getElementById('addNodeModal').style.display = 'none';
}

// Select and move objects
function selectObject(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedObject = objects.find(obj => {
        if (obj.type === 'rectangle') {
            return x > obj.x - obj.width/2 && x < obj.x + obj.width/2 && y > obj.y - obj.height/2 && y < obj.y + obj.height/2;
        }
    });
    showInspector(selectedObject);
}

function moveObject(e) {
    if (!selectedObject) return;
    const rect = canvas.getBoundingClientRect();
    selectedObject.x = e.clientX - rect.left;
    selectedObject.y = e.clientY - rect.top;
    drawObjects();
}

// Inspector for properties
function showInspector(obj) {
    const inspector = document.getElementById('inspectorProperties');
    inspector.innerHTML = '';
    if (!obj) return;
    for (let key in obj) {
        const input = document.createElement('input');
        input.value = obj[key];
        input.placeholder = key;
        input.oninput = () => {
            obj[key] = isNaN(obj[key]) ? input.value : parseFloat(input.value);
            drawObjects();
        };
        inspector.appendChild(input);
    }
}

// Save to LocalStorage
function saveProject() {
    localStorage.setItem('gameProject', JSON.stringify(objects));
    alert('Project Saved!');
}

// Load from LocalStorage
function loadProject() {
    const data = JSON.parse(localStorage.getItem('gameProject'));
    if (data) {
        objects = data;
        drawObjects();
        alert('Project Loaded!');
    }
}

// New Project
function newProject() {
    if (confirm('Are you sure? All unsaved work will be lost.')) {
        objects = [];
        drawObjects();
    }
}

// Export project as JSON
function exportProject() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objects));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "game_project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
              }
