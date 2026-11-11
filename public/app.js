const todoList = document.getElementById('todo-list');
const addForm = document.getElementById('add-form');
const newTodoInput = document.getElementById('new-todo');
const activeCount = document.getElementById('active-count');
const filterButtons = document.querySelectorAll('.filter-tabs button');

let allTodos = [];
let currentFilter = 'all';

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

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u00d7';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
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
    body: JSON.stringify({ text }),
  });

  newTodoInput.value = '';
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
