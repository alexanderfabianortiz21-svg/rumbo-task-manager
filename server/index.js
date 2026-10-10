import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const PRIORITIES = ['low', 'medium', 'high'];
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');

app.use(express.json());

const toTask = (r) => ({ ...r, done: Boolean(r.done) });

function validate(body, partial = false) {
  const out = {};
  if (body.title !== undefined || !partial) {
    const title = String(body.title ?? '').trim();
    if (!title) return { error: 'Title is required' };
    if (title.length > 200) return { error: 'Title must be 200 characters or less' };
    out.title = title;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) return { error: 'Invalid priority' };
    out.priority = body.priority;
  }
  if (body.due_date !== undefined) out.due_date = body.due_date || null;
  if (body.done !== undefined) out.done = body.done ? 1 : 0;
  return { data: out };
}

app.get('/api/tasks', (_req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY done ASC, created_at DESC, id DESC').all();
  res.json(rows.map(toTask));
});

app.post('/api/tasks', (req, res) => {
  const { data, error } = validate(req.body);
  if (error) return res.status(400).json({ error });
  const info = db
    .prepare('INSERT INTO tasks (title, priority, due_date) VALUES (@title, @priority, @due_date)')
    .run({ title: data.title, priority: data.priority || 'medium', due_date: data.due_date || null });
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toTask(row));
});

app.patch('/api/tasks/:id', (req, res) => {
  const { data, error } = validate(req.body, true);
  if (error) return res.status(400).json({ error });
  const keys = Object.keys(data);
  if (!keys.length) return res.status(400).json({ error: 'Nothing to update' });
  const sets = keys.map((k) => `${k} = @${k}`).join(', ');
  const info = db.prepare(`UPDATE tasks SET ${sets} WHERE id = @id`).run({ ...data, id: req.params.id });
  if (!info.changes) return res.status(404).json({ error: 'Task not found' });
  res.json(toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)));
});

app.delete('/api/tasks/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
