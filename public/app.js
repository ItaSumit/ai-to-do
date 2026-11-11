const todoList = document.getElementById('todo-list');
const addForm = document.getElementById('add-form');
const newTodoInput = document.getElementById('new-todo');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date-input');
const activeCount = document.getElementById('active-count');
const filterButtons = document.querySelectorAll('.filter-tabs button');

let allTodos = [];
let currentFilter = 'all';

// Parse YYYY-MM-DD as a local date; new Date(string) would treat it as UTC
function parseDueDate(dueDate) {
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDueDate(dueDate) {
  return parseDueDate(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.completed) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return parseDueDate(todo.dueDate) < today;
}

async function loadTodos() {
  const res = await fetch('/api/todos');
  allTodos = await res.json();
  applyFilter();
  updateStats();
}

function applyFilter() {
  let visible = allTodos;
  if (currentFilter === 'active') {
    visible = allTodos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    visible = allTodos.filter(todo => todo.completed);
  }
  renderTodos(visible);
}

function renderTodos(todos) {
  todoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'todo-item completed' : 'todo-item';
    if (isOverdue(todo)) li.classList.add('overdue');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = todo.text;

    const badge = document.createElement('span');
    badge.className = `priority-badge priority-${todo.priority.toLowerCase()}`;
    badge.textContent = todo.priority;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u00d7';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(badge);
    if (todo.dueDate) {
      const dueDate = document.createElement('span');
      dueDate.className = 'due-date';
      dueDate.textContent = `Due: ${formatDueDate(todo.dueDate)}`;
      li.appendChild(dueDate);
    }
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

async function updateStats() {
  const res = await fetch('/api/stats');
  const stats = await res.json();
  activeCount.textContent = stats.active;
}

async function toggleTodo(id) {
  await fetch(`/api/todos/${id}`, { method: 'PATCH' });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  loadTodos();
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = newTodoInput.value.trim();
  if (!text) return;

  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, priority: prioritySelect.value, dueDate: dueDateInput.value || null }),
  });

  newTodoInput.value = '';
  dueDateInput.value = '';
  loadTodos();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle('active', b === button));
    applyFilter();
  });
});

// Load todos on page load
loadTodos();
