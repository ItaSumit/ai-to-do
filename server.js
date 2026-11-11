const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory todo storage
let todos = [
  { id: 1, text: 'Review pull request', completed: false, priority: 'Medium', dueDate: null },
  { id: 2, text: 'Write unit tests', completed: true, priority: 'Medium', dueDate: null },
  { id: 3, text: 'Update documentation', completed: false, priority: 'Medium', dueDate: null },
  { id: 4, text: 'Fix login bug', completed: false, priority: 'Medium', dueDate: null },
  { id: 5, text: 'Deploy to staging', completed: true, priority: 'Medium', dueDate: null },
];

let nextId = 6;

const PRIORITIES = ['Low', 'Medium', 'High'];

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// GET stats
app.get('/api/stats', (req, res) => {
  const active = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;
  res.json({ active, completed, total: todos.length });
});

// POST a new todo
app.post('/api/todos', (req, res) => {
  const { text, priority = 'Medium', dueDate } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of Low, Medium, High' });
  }
  const trimmedDueDate = typeof dueDate === 'string' ? dueDate.trim() : '';
  const todo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    priority,
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(trimmedDueDate) ? trimmedDueDate : null,
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// PATCH toggle completion
app.patch('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todo.completed = !todo.completed;
  res.json(todo);
});

// DELETE a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.splice(index, 1);
  res.json({ message: 'Deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Todo app running at http://localhost:${PORT}`);
});

module.exports = app;
