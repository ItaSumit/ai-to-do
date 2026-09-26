const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const BASE = 'http://localhost:3000';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Todo API', () => {

  it('GET /api/todos returns an array of todos', async () => {
    const { status, body } = await request('GET', '/api/todos');
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0, 'Should have seed todos');
  });

  it('POST /api/todos creates a new todo', async () => {
    const { status, body } = await request('POST', '/api/todos', { text: 'Test task' });
    assert.strictEqual(status, 201);
    assert.strictEqual(body.text, 'Test task');
    assert.strictEqual(body.completed, false);
  });

  it('POST /api/todos rejects empty text', async () => {
    const { status } = await request('POST', '/api/todos', { text: '' });
    assert.strictEqual(status, 400);
  });

  it('GET /api/stats returns correct active count', async () => {
    // First, get the actual todos to compute expected active count
    const { body: todos } = await request('GET', '/api/todos');
    const expectedActive = todos.filter(t => !t.completed).length;

    const { status, body: stats } = await request('GET', '/api/stats');
    assert.strictEqual(status, 200);
    assert.strictEqual(stats.active, expectedActive,
      `Expected ${expectedActive} active todos but API returned ${stats.active}`);
  });

  it('DELETE /api/todos/:id actually removes the todo', async () => {
    // Create a todo, then delete it, then verify it is gone
    const { body: created } = await request('POST', '/api/todos', { text: 'Delete me' });
    const { status } = await request('DELETE', `/api/todos/${created.id}`);
    assert.strictEqual(status, 200);

    const { body: todos } = await request('GET', '/api/todos');
    const found = todos.find(t => t.id === created.id);
    assert.strictEqual(found, undefined, 'Deleted todo should not appear in list');
  });

});
