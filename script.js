let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const lists = {
  "todo": document.getElementById("todoList"),
  "in-progress": document.getElementById("progressList"),
  "done": document.getElementById("doneList"),
  "archived": document.getElementById("archivedContainer")
};

const archiveToggle = document.getElementById("archiveToggle");
const archiveList = document.getElementById("archiveList");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTagColor(tag) {
  const colors = {
    work: "#f39c12",
    study: "#3498db",
    health: "#2ecc71",
    urgent: "#e74c3c"
  };
  return colors[tag.toLowerCase()] || "#9b59b6";
}

function renderTasks() {
  Object.values(lists).forEach(list => list.innerHTML = "");
  const filterDate = document.getElementById("filterDate").value;
  const filterTag = document.getElementById("filterTag").value.toLowerCase();

  const now = new Date();
  tasks.forEach(task => {
    if (task.status === "archived" && !archiveList.classList.contains("hidden")) return;
    if (filterDate && task.due !== filterDate) return;
    if (filterTag && !task.tags.some(t => t.toLowerCase().includes(filterTag))) return;

    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.dataset.id = task.id;

    let tagHTML = task.tags.map(t => `<span class="tag" style="background:${createTagColor(t)}">${t}</span>`).join("");
    div.innerHTML = `
      <input type="checkbox" ${task.status === "done" ? "checked" : ""}/>
      <strong>${task.title}</strong>
      <button class="delete">×</button>
      <div class="meta">
        ${task.note || ""}<br/>
        📅 ${task.due || ""} ${tagHTML}
      </div>
    `;

    div.querySelector("input[type=checkbox]").addEventListener("change", e => {
      task.status = e.target.checked ? "done" : "todo";
      if (task.status === "done") task.completedAt = Date.now();
      renderTasks(); saveTasks();
    });

    div.querySelector(".delete").onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks(); saveTasks();
    };

    div.addEventListener("dragstart", e => e.dataTransfer.setData("id", task.id));
    lists[task.status]?.appendChild(div);
  });
}

document.querySelectorAll(".task-list").forEach(list => {
  list.addEventListener("dragover", e => e.preventDefault());
  list.addEventListener("drop", e => {
    const id = e.dataTransfer.getData("id");
    const targetStatus = list.parentElement.dataset.status;
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = targetStatus;
      renderTasks(); saveTasks();
    }
  });
});

document.getElementById("addTask").onclick = () => {
  const title = document.getElementById("taskTitle").value.trim();
  const due = document.getElementById("taskDue").value;
  const tags = document.getElementById("taskTags").value.split("#").filter(Boolean).map(t => t.trim());
  const note = document.getElementById("taskNote").value.trim();
  const repeat = document.getElementById("taskRepeat").value;

  if (!title) return;

  tasks.push({
    id: Date.now().toString(),
    title, due, tags, note, repeat,
    status: "todo",
    createdAt: Date.now()
  });

  renderTasks(); saveTasks();
};

archiveToggle.onclick = () => archiveList.classList.toggle("hidden");

function checkArchiving() {
  const now = Date.now();
  tasks.forEach(task => {
    if (task.status === "done" && now - task.completedAt >= 3600000) {
      task.status = "archived";
    }
  });
  renderTasks(); saveTasks();
}

function checkRepeats() {
  const today = new Date().toISOString().split("T")[0];
  tasks.forEach(task => {
    if (!task.repeat || task.due !== today || task.status !== "done") return;

    let nextDate = new Date(task.due);
    if (task.repeat === "daily") nextDate.setDate(nextDate.getDate() + 1);
    if (task.repeat === "weekly") nextDate.setDate(nextDate.getDate() + 7);
    if (task.repeat === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);

    tasks.push({ ...task, id: Date.now().toString(), due: nextDate.toISOString().split("T")[0], status: "todo" });
  });
  saveTasks();
}

renderTasks();
setInterval(checkArchiving, 60000); // 1 phút
checkRepeats();
