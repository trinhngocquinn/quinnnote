
let tasks = [];

function addTask() {
    const title = document.getElementById("title").value;
    const dueDate = document.getElementById("due-date").value;
    const repeat = document.getElementById("repeat").value;
    const tag = document.getElementById("tag").value;

    const task = {
        id: Date.now(),
        title,
        dueDate,
        repeat,
        tag,
        status: "todo",
        created: new Date(),
        completedTime: null
    };

    tasks.push(task);
    renderTasks();
}

function renderTasks() {
    ["todo", "in-progress", "completed", "archived"].forEach(id => {
        document.getElementById(id).innerHTML = `<h2>${id.replace("-", " ")}</h2>`;
    });

    const now = new Date();
    tasks.forEach(task => {
        if (task.status === "completed" && task.completedTime && (now - new Date(task.completedTime)) > 3600000) {
            task.status = "archived";
        }

        const taskEl = document.createElement("div");
        taskEl.className = "task";
        taskEl.innerHTML = `
            <strong>${task.title}</strong><br />
            ${task.dueDate}<br />
            <span class="tag ${task.tag}">${task.tag}</span>
            <button class="delete" onclick="deleteTask(${task.id})">x</button>
            <br/><input type="checkbox" onchange="toggleComplete(${task.id})" ${task.status === "completed" ? "checked" : ""} />
        `;

        document.getElementById(task.status).appendChild(taskEl);
    });
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task.status !== "completed") {
        task.status = "completed";
        task.completedTime = new Date();
    } else {
        task.status = "todo";
        task.completedTime = null;
    }
    renderTasks();
}

function filterTasks() {
    const date = document.getElementById("filter-date").value;
    const tag = document.getElementById("filter-tag").value;

    document.querySelectorAll(".task").forEach(task => task.style.display = "block");

    tasks.forEach(task => {
        const el = [...document.querySelectorAll(".task")].find(t => t.innerText.includes(task.title));
        if (date && task.dueDate !== date) el.style.display = "none";
        if (tag && task.tag !== tag) el.style.display = "none";
    });
}

function showArchived() {
    const arch = document.getElementById("archived");
    arch.style.display = arch.style.display === "none" ? "block" : "none";
}

setInterval(renderTasks, 60000);
