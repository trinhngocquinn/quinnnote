const taskForm = document.getElementById("task-form");
const archiveToggle = document.getElementById("toggle-archive");
const archiveSection = document.getElementById("archive");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
  ["todo", "in-progress", "done", "archive"].forEach(status => {
    const list = document.getElementById(`${status}-list`);
    if (list) list.innerHTML = '';
  });

  tasks.forEach(task => {
    if (task.status === "archived") return;

    const taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.draggable = true;
    taskDiv.dataset.id = task.id;
    taskDiv.innerHTML = `
      <strong>${task.title}</strong>
      <div class="meta">${task.deadline || ""} ${task.tag || ""}</div>
      <div class="meta">${task.description || ""}</div>
      <button onclick="deleteTask('${task.id}')">🗑</button>
    `;
    taskDiv.addEventListener("dragstart", handleDragStart);
    taskDiv.addEventListener("dragend", handleDragEnd);

    const list = document.getElementById(`${task.status}-list`);
    list.appendChild(taskDiv);
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
}
function handleDragEnd() {}

document.querySelectorAll(".task-list").forEach(list => {
  list.addEventListener("dragover", e => e.preventDefault());
  list.addEventListener("drop", e => {
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find(t => t.id === id);
    const status = list.parentElement.dataset.status;
    task.status = status;
    if (status === "done") {
      setTimeout(() => archiveTask(id), 3600000); // 1 hour
    }
    renderTasks();
  });
});

taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const task = {
    id: Date.now().toString(),
    title: taskForm["task-title"].value,
    deadline: taskForm["task-deadline"].value,
    tag: taskForm["task-tag"].value,
    description: taskForm["task-description"].value,
    repeat: taskForm["task-repeat"].value,
    status: "todo",
    created: new Date().toISOString()
  };
  tasks.push(task);
  renderTasks();
  taskForm.reset();
});

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function archiveTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task && task.status === "done") {
    task.status = "archived";
    renderTasks();
  }
}

archiveToggle.addEventListener("click", () => {
  archiveSection.classList.toggle("hidden");
});

renderTasks();
