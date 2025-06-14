let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let archive = JSON.parse(localStorage.getItem('archive') || '[]');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function saveArchive() {
  localStorage.setItem('archive', JSON.stringify(archive));
}

function render() {
  ['todo', 'inprogress', 'done'].forEach(status => {
    const container = document.getElementById(`${status}-list`);
    container.innerHTML = '';
    tasks.filter(t => t.status === status).forEach(task => {
      if (shouldHide(task)) return;
      const el = document.createElement('div');
      el.className = 'task';
      el.setAttribute('draggable', true);
      el.dataset.id = task.id;
      el.innerHTML = `
        <div class="tag" style="background:${tagColor(task.tag)}">${task.tag}</div>
        <strong>${task.title}</strong>
        <div>${task.desc || ''}</div>
        <div>📅 ${task.deadline || 'No due'}</div>
        <div class="controls">
          <input type="checkbox" ${task.status === 'done' ? 'checked' : ''} onclick="markDone('${task.id}')"/>
          <button onclick="deleteTask('${task.id}')">🗑️</button>
        </div>`;
      el.ondragstart = e => e.dataTransfer.setData('text/plain', task.id);
      container.appendChild(el);
    });
  });
}
function shouldHide(task) {
  const fdate = document.getElementById('filter-date').value;
  const ftag = document.getElementById('filter-tag').value.toLowerCase();
  if (fdate && task.deadline !== fdate) return true;
  if (ftag && !task.tag.toLowerCase().includes(ftag)) return true;
  return false;
}
function tagColor(tag) {
  const palette = ['#f2c57c', '#86e3ce', '#ffaaa5', '#c3bef0', '#d5aaff'];
  return palette[tag.length % palette.length];
}

function addTask() {
  const task = {
    id: crypto.randomUUID(),
    title: document.getElementById('task-title').value,
    deadline: document.getElementById('task-deadline').value,
    tag: document.getElementById('task-tag').value,
    desc: document.getElementById('task-desc').value,
    repeat: document.getElementById('task-repeat').value,
    status: 'todo',
    created: Date.now()
  };
  tasks.push(task);
  saveTasks();
  render();
}
function markDone(id) {
  const task = tasks.find(t => t.id === id);
  task.status = 'done';
  task.doneAt = Date.now();
  saveTasks();
  render();
}
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}
function autoArchive() {
  const now = Date.now();
  tasks = tasks.filter(task => {
    if (task.status === 'done' && now - task.doneAt > 3600000) {
      archive.push(task);
      return false;
    }
    return true;
  });
  saveTasks();
  saveArchive();
  render();
}
function autoRepeat() {
  const today = new Date().toISOString().slice(0, 10);
  tasks.forEach(t => {
    if (t.status === 'done' && t.deadline === today && t.repeat) {
      const newTask = { ...t, id: crypto.randomUUID(), status: 'todo' };
      if (t.repeat === 'daily') newTask.deadline = nextDate(today, 1);
      if (t.repeat === 'weekly') newTask.deadline = nextDate(today, 7);
      if (t.repeat === 'monthly') newTask.deadline = nextDate(today, 30);
      tasks.push(newTask);
    }
  });
  saveTasks();
}
function nextDate(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

document.getElementById('add-task').onclick = addTask;
document.querySelectorAll('.task-list').forEach(el => {
  el.ondragover = e => e.preventDefault();
  el.ondrop = e => {
    const id = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === id);
    task.status = el.parentElement.dataset.status;
    saveTasks();
    render();
  };
});
document.getElementById('show-archive').onclick = () => {
  const arch = document.getElementById('archived-list');
  arch.innerHTML = archive.map(t => `<li>${t.title} – ${t.deadline}</li>`).join('');
  document.getElementById('archive-modal').style.display = 'block';
};
['filter-date', 'filter-tag'].forEach(id => {
  document.getElementById(id).oninput = render;
});

render();
setInterval(autoArchive, 30000);
setInterval(autoRepeat, 60000);
