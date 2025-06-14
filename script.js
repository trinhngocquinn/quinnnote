
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById("task-input");
  const dateInput = document.getElementById("task-date");
  const repeat = document.getElementById("repeat");
  const tagInput = document.getElementById("tag-input");

  const task = {
    id: Date.now(),
    title: input.value,
    date: dateInput.value,
    repeat: repeat.value,
    tag: tagInput.value,
    status: "todo"
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  input.value = "";
  dateInput.value = "";
  tagInput.value = "";
}

function renderTasks() {
  ["todo", "inprogress", "done"].forEach(status => {
    const col = document.getElementById(status);
    col.innerHTML = `<h2>${status.charAt(0).toUpperCase() + status.slice(1)}</h2>`;
    tasks.filter(t => t.status === status).forEach(task => {
      const div = document.createElement("div");
      div.className = "task";
      div.draggable = true;
      div.dataset.id = task.id;
      div.innerHTML = `<strong>${task.title}</strong><br><span class="tag">${task.tag} - ${task.date} (${task.repeat})</span>`;
      div.addEventListener("dragstart", dragStart);
      col.appendChild(div);
    });
  });
}

function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
}

["todo", "inprogress", "done"].forEach(status => {
  const col = document.getElementById(status);
  col.addEventListener("dragover", e => e.preventDefault());
  col.addEventListener("drop", e => {
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find(t => t.id == id);
    if (task) {
      task.status = status;
      saveTasks();
      renderTasks();
    }
  });
});

renderTasks();
