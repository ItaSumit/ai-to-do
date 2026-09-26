const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory todo storage
let todos = [
  { id: 1, text: 'Review pull request', completed: false },
  { id: 2, text: 'Write unit tests', completed: true },
  { id: 3, text: 'Update documentation', completed: false },
  { id: 4, text: 'Fix login bug', completed: false },
  { id: 5, text: 'Deploy to staging', completed: true },
];

let nextId = 6;

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
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const todo = { id: nextId++, text: text.trim(), completed: false };
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
