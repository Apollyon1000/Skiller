// Skill Tree Data

const GRID_SIZE = 50;
let connectingFrom = null;

let skillTree = {
  nodes: {},
  connections: []
};

let nodeCounter = 0;

// Snap a value to grid
function snap(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

const viewport = document.getElementById("viewport");
const nodesContainer = document.getElementById("nodes");

function createNode(x, y) {
  const id = `node-${nodeCounter++}`;

  const nodeData = {
    id,
    x: snap(x) - 40,
    y: snap(y) - 40,
    size: 80,
    color: "#4CAF50",
    title: "New Skill",
    description: "",
    unlocked: false,
    prerequisites: []
  };

  skillTree.nodes[id] = nodeData;

  renderNode(nodeData);
}

function renderNode(node) {
  const el = document.createElement("div");
  el.className = "node";
  el.dataset.id = node.id;

  el.style.width = `${node.size}px`;
  el.style.height = `${node.size}px`;
  el.style.background = node.color;
  el.style.left = `${node.x}px`;
  el.style.top = `${node.y}px`;

  el.innerText = node.title;

  makeDraggable(el);

  nodesContainer.appendChild(el);

el.addEventListener("click", (e) => {
  e.stopPropagation();

  const id = el.dataset.id;

  // ALT + click = delete node
  if (e.altKey) {
    deleteNode(id);
    return;
  }

  // SHIFT + click = open editor
  if (e.shiftKey) {
    openNodeEditor(id);
    return;
  }

  // Only ignore the click for normal connection logic if it was after a drag
  if (el._ignoreNextClick) return;

  // Normal connection logic
  if (!connectingFrom) {
    connectingFrom = id;
    el.style.outline = "3px solid yellow";
  } else if (connectingFrom !== id) {
    skillTree.connections.push({
      from: connectingFrom,
      to: id
    });

    cancelConnectionMode();
    renderConnections();
  }
});

}

function clearNodeHighlights() {
  document.querySelectorAll(".node").forEach(n => {
    n.style.outline = "none";
  });
}

viewport.addEventListener("dblclick", (e) => {
  if (connectingFrom) return;

  const rect = viewport.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  createNode(x, y);
});

function makeDraggable(el) {
  let offsetX, offsetY;
  let wasDragged = false;

  el.addEventListener("mousedown", (e) => {
    e.preventDefault(); // ← prevents text selection
    wasDragged = false;

    const id = el.dataset.id;
    const node = skillTree.nodes[id];

    offsetX = e.clientX - node.x;
    offsetY = e.clientY - node.y;

    function onMouseMove(e) {
      wasDragged = true;

      node.x = snap(e.clientX - offsetX + node.size / 2) - node.size / 2;
      node.y = snap(e.clientY - offsetY + node.size / 2) - node.size / 2;

      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
      renderConnections();
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      // Only block click if drag occurred
      if (wasDragged) {
        el._ignoreNextClick = true;
        setTimeout(() => el._ignoreNextClick = false, 0);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}


const svg = document.getElementById("connections");

function renderConnections() {
  svg.innerHTML = "";

  skillTree.connections.forEach(conn => {
    const from = skillTree.nodes[conn.from];
    const to = skillTree.nodes[conn.to];

    if (!from || !to) return;

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    line.setAttribute("x1", from.x + from.size / 2);
    line.setAttribute("y1", from.y + from.size / 2);
    line.setAttribute("x2", to.x + to.size / 2);
    line.setAttribute("y2", to.y + to.size / 2);
    line.setAttribute("stroke", "#aaa");
    line.setAttribute("stroke-width", "4");

    svg.appendChild(line);
  });
}

function deleteNode(id) {
  // Remove node data
  delete skillTree.nodes[id];

  // Remove connections involving this node
  skillTree.connections = skillTree.connections.filter(
    c => c.from !== id && c.to !== id
  );

  // Remove node element
  const el = document.querySelector(`.node[data-id="${id}"]`);
  if (el) el.remove();

  cancelConnectionMode();
  renderConnections();
}

function cancelConnectionMode() {
  connectingFrom = null;
  clearNodeHighlights();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cancelConnectionMode();
  }
});

// vvv NODE EDITOR vvv

// Node Editor Elements
const editor = document.getElementById("node-editor");
const inputTitle = document.getElementById("node-title");
const inputDesc = document.getElementById("node-desc");
const inputColor = document.getElementById("node-color");
const inputSize = document.getElementById("node-size");
const inputImage = document.getElementById("node-image");
const btnClose = document.getElementById("close-editor");

let editingNodeId = null;

// Open editor for a node
function openNodeEditor(nodeId) {
  const node = skillTree.nodes[nodeId];
  if (!node) return;

  editingNodeId = nodeId;

  inputTitle.value = node.title;
  inputDesc.value = node.description;
  inputColor.value = node.color;
  inputSize.value = node.size;
  inputImage.value = ""; // reset file input

  editor.classList.remove("hidden");
}

// Close editor
btnClose.addEventListener("click", () => {
  editor.classList.add("hidden");
  editingNodeId = null;
});

// Sync changes
inputTitle.addEventListener("input", () => {
  if (!editingNodeId) return;
  const node = skillTree.nodes[editingNodeId];
  node.title = inputTitle.value;
  document.querySelector(`.node[data-id="${editingNodeId}"]`).innerText = node.title;
});

inputDesc.addEventListener("input", () => {
  if (!editingNodeId) return;
  skillTree.nodes[editingNodeId].description = inputDesc.value;
});

inputColor.addEventListener("input", () => {
  if (!editingNodeId) return;
  const node = skillTree.nodes[editingNodeId];
  node.color = inputColor.value;
  document.querySelector(`.node[data-id="${editingNodeId}"]`).style.background = node.color;
});

inputSize.addEventListener("input", () => {
  if (!editingNodeId) return;
  const node = skillTree.nodes[editingNodeId];
  node.size = parseInt(inputSize.value);
  const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
  el.style.width = `${node.size}px`;
  el.style.height = `${node.size}px`;
});

inputImage.addEventListener("change", (e) => {
  if (!editingNodeId) return;
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    skillTree.nodes[editingNodeId].image = reader.result;

    const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
    el.style.backgroundImage = `url(${reader.result})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  };
  reader.readAsDataURL(file);
});
