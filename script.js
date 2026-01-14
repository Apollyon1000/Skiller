// Skill Tree Data

const GRID_SIZE = 50;
let connectingFrom = null;

let skillTree = {
  nodes: {},
  connections: []
};

let nodeCounter = 0;

let editingNodeId = null;

const editor = document.getElementById("node-editor");
const editTitle = document.getElementById("edit-title");
const editColor = document.getElementById("edit-color");
const editSize = document.getElementById("edit-size");
const closeEditorBtn = document.getElementById("close-editor");
const editImage = document.getElementById("edit-image");
const editShape = document.getElementById("edit-shape");

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
  image: null,
  shape: "circle",
  unlocked: false,
  prerequisites: []
};

  skillTree.nodes[id] = nodeData;

  renderNode(nodeData);
}

function renderNode(node) {
  const el = document.createElement("div");
  el.className = "node";
  el.classList.add(node.shape);
  el.dataset.id = node.id;

  el.style.width = `${node.size}px`;
  el.style.height = `${node.size}px`;
  el.style.background = node.color;
  el.style.left = `${node.x}px`;
  el.style.top = `${node.y}px`;

const icon = document.createElement("div");
icon.className = "node-icon";

if (node.image) {
  icon.style.backgroundImage = `url(${node.image})`;
}

const title = document.createElement("div");
title.className = "node-title";
title.innerText = node.title;

el.appendChild(icon);
el.appendChild(title);

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

function openNodeEditor(id) {
  const node = skillTree.nodes[id];
  if (!node) return;

  editingNodeId = id;

  editTitle.value = node.title;
  editColor.value = node.color;
  editSize.value = node.size;

  editor.classList.remove("hidden");

  editImage.value = "";
  editShape.value = node.shape;
}

editTitle.addEventListener("input", () => {
  const node = skillTree.nodes[editingNodeId];
  if (!node) return;

  node.title = editTitle.value;

  const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
if (el) {
  const titleEl = el.querySelector(".node-title");
  if (titleEl) titleEl.innerText = node.title;
}
});

editColor.addEventListener("input", () => {
  const node = skillTree.nodes[editingNodeId];
  if (!node) return;

  node.color = editColor.value;

  const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
  if (el) el.style.background = node.color;
});

editSize.addEventListener("input", () => {
  const node = skillTree.nodes[editingNodeId];
  if (!node) return;

  node.size = parseInt(editSize.value, 10);

  const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
  if (!el) return;

  el.style.width = `${node.size}px`;
  el.style.height = `${node.size}px`;

  renderConnections();
});

function closeEditor() {
  editor.classList.add("hidden");
  editingNodeId = null;
}

closeEditorBtn.addEventListener("click", closeEditor);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeEditor();
  }
});

editImage.addEventListener("change", () => {
  const file = editImage.files[0];
  if (!file || !editingNodeId) return;

  const reader = new FileReader();

  reader.onload = () => {
    const node = skillTree.nodes[editingNodeId];
    node.image = reader.result;

    const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
    if (!el) return;

    const icon = el.querySelector(".node-icon");
    if (icon) {
      icon.style.backgroundImage = `url(${node.image})`;
    }
  };

  reader.readAsDataURL(file);
});

editShape.addEventListener("change", () => {
  const node = skillTree.nodes[editingNodeId];
  if (!node) return;

  node.shape = editShape.value;

  const el = document.querySelector(`.node[data-id="${editingNodeId}"]`);
  if (!el) return;

  el.classList.remove("circle", "square", "hex");
  el.classList.add(node.shape);
});
