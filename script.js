let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let archive = JSON.parse(localStorage.getItem("archive") || "[]");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveArchive() {
  localStorage.setItem("archive", JSON.stringify(archive));
}

function renderTasks() {
  ["todo", "inprogress", "done"].forEach(status => {
    const col = document.getElementById(status);
    col.innerHTML = "";
    tasks.filter(t => t.status === status && matchFilter(t)).forEach(task => {
      const div = document.createElement("div");
      div.className = "task";
      div.textContent = task.name;
      div.draggable = true;
      div.dataset.id = task.id;
      div.dataset.tag = task.tag || "";
      div.addEventListener("dragstart", dragStart);
      div.addEventListener("dblclick", () => completeTask(task.id));
      col.appendChild(div);
    });
  });
}

function dragStart(e) {
  e.dataTransfer.setData("text", e.target.dataset.id);
}

document.querySelectorAll(".task-list").forEach(col => {
  col.addEventListener("dragover", e => e.preventDefault());
  col.addEventListener("drop", e => {
    const id = e.dataTransfer.getData("text");
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = col.id;
      saveTasks();
      renderTasks();
    }
  });
});

function addTask() {
  const name = document.getElementById("taskInput").value.trim();
  const due = document.getElementById("dueDate").value;
  const repeat = document.getElementById("repeatSelect").value;
  const tag = document.getElementById("tagInput").value.trim();
  if (!name) return;

  const task = {
    id: Date.now().toString(),
    name, due, repeat, tag,
    status: "todo",
    created: Date.now()
  };
  tasks.push(task);
  saveTasks();
  renderTasks();
}

function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = "done";
    saveTasks();
    renderTasks();
    setTimeout(() => archiveTask(id), 3600000); // 1 hour
  }
}

function archiveTask(id) {
  const index = tasks.findIndex(t => t.id === id && t.status === "done");
  if (index !== -1) {
    archive.push(tasks[index]);
    tasks.splice(index, 1);
    saveTasks();
    saveArchive();
    renderTasks();
  }
}

function toggleArchive() {
  const archiveDiv = document.getElementById("archive");
  archiveDiv.style.display = archiveDiv.style.display === "none" ? "block" : "none";
  renderArchive();
}

function renderArchive() {
  const div = document.getElementById("archivedTasks");
  div.innerHTML = "";
  archive.forEach(task => {
    const d = document.createElement("div");
    d.className = "task";
    d.textContent = task.name + " (archived)";
    div.appendChild(d);
  });
}

function matchFilter(task) {
  const tag = document.getElementById("tagFilter").value;
  const date = document.getElementById("dateFilter").value;
  if (tag && task.tag !== tag) return false;
  if (date && task.due !== date) return false;
  return true;
}

document.getElementById("tagFilter").addEventListener("change", renderTasks);
document.getElementById("dateFilter").addEventListener("change", renderTasks);

renderTasks();