// Skill Tree Data

const GRID_SIZE = 50;

let skillTree = {
  nodes: {}
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
    x: snap(x),
    y: snap(y),
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
}

viewport.addEventListener("dblclick", (e) => {
  const rect = viewport.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  createNode(x, y);
});

function makeDraggable(el) {
  let offsetX, offsetY;

  el.addEventListener("mousedown", (e) => {
    const id = el.dataset.id;
    const node = skillTree.nodes[id];

    offsetX = e.clientX - node.x;
    offsetY = e.clientY - node.y;

    function onMouseMove(e) {
      node.x = snap(e.clientX - offsetX);
      node.y = snap(e.clientY - offsetY);

      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}
