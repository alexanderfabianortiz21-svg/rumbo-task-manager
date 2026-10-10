import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import { useTween } from './useTween.js';
import TaskItem from './TaskItem.jsx';
import Horizon from './Horizon.jsx';
import Confetti from './Confetti.jsx';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Open' },
  { key: 'done', label: 'Done' },
];
const PRIORITIES = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 19 ? 'Good afternoon' : 'Good evening';
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [burst, setBurst] = useState(0);
  const settled = useRef(false);
  const wasAllDone = useRef(false);

  useEffect(() => {
    api.list().then(setTasks).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const run = async (fn) => {
    setError('');
    try { await fn(); } catch (e) { setError(e.message); }
  };

  const addTask = (e) => {
    e.preventDefault();
    run(async () => {
      const created = await api.create({ title, priority, due_date: dueDate });
      setTasks((t) => [created, ...t]);
      setTitle('');
      setDueDate('');
    });
  };

  const toggle = (task) =>
    run(async () => {
      const updated = await api.update(task.id, { done: !task.done });
      setTasks((t) => t.map((x) => (x.id === task.id ? updated : x)));
    });

  const rename = (id, newTitle) =>
    run(async () => {
      const updated = await api.update(id, { title: newTitle });
      setTasks((t) => t.map((x) => (x.id === id ? updated : x)));
    });

  const remove = (id) =>
    run(async () => {
      await api.remove(id);
      setTasks((t) => t.filter((x) => x.id !== id));
    });

  const remaining = tasks.filter((t) => !t.done).length;
  const done = tasks.length - remaining;
  const progress = tasks.length ? done / tasks.length : 0;
  const p = useTween(progress);
  const allDone = tasks.length > 0 && remaining === 0;

  // Celebrate only when the user finishes the last open task, not on page load.
  useEffect(() => {
    if (loading) return;
    if (!settled.current) {
      settled.current = true;
      wasAllDone.current = allDone;
      return;
    }
    if (allDone && !wasAllDone.current) setBurst((b) => b + 1);
    wasAllDone.current = allDone;
  }, [allDone, loading]);

  const visible = useMemo(
    () => tasks.filter((t) => filter === 'all' || (filter === 'done' ? t.done : !t.done)),
    [tasks, filter]
  );

  let status;
  if (loading) status = 'Checking the sky…';
  else if (!tasks.length) status = 'A clear horizon. Add your first task below.';
  else if (allDone) status = 'Everything is done. Enjoy the light.';
  else status = `${done} of ${tasks.length} done. ${remaining} more and the sun is up.`;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <header className="hero">
        <div className="sky-dawn" style={{ opacity: p }} />
        <div className="wrap hero-inner">
          <div className="brand reveal" style={{ '--d': '0ms' }}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M3 18a9 9 0 0 1 18 0" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.2" fill="#F6B65B" />
            </svg>
            Rumbo
          </div>
          <p className="date reveal" style={{ '--d': '90ms' }}>{today}</p>
          <h1 className="reveal" style={{ '--d': '170ms' }}>{greeting()}.</h1>
          <p className="status reveal" style={{ '--d': '260ms' }} aria-live="polite">{status}</p>
        </div>
        <Horizon p={p} done={done} total={tasks.length} />
      </header>

      <main className="sheet">
        <div className="wrap">
          <form className="add" onSubmit={addTask}>
            <label className="sr" htmlFor="new-title">Task title</label>
            <input
              id="new-title"
              className="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What will move you forward today?"
              maxLength={200}
              autoComplete="off"
            />
            <div className="add-row">
              <div className="prio" role="radiogroup" aria-label="Priority">
                {PRIORITIES.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={priority === o.key}
                    className={`chip ${o.key} ${priority === o.key ? 'on' : ''}`}
                    onClick={() => setPriority(o.key)}
                  >
                    <span className="dot" />
                    {o.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                className="date-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Due date"
              />
              <button className="submit" type="submit" disabled={!title.trim()}>Add task</button>
            </div>
          </form>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="toolbar">
            <div className="seg" style={{ '--i': FILTERS.findIndex((f) => f.key === filter) }}>
              <span className="thumb" />
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  aria-pressed={filter === f.key}
                  className={filter === f.key ? 'active' : ''}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="left">{remaining} open</span>
          </div>

          {loading ? (
            <p className="empty">Loading your tasks…</p>
          ) : visible.length === 0 ? (
            <div className="empty">
              <strong>{tasks.length === 0 ? 'Nothing on the horizon yet.' : 'Nothing in this view.'}</strong>
              {tasks.length === 0 && <span>Add a task above, then finish it to watch the sun rise.</span>}
            </div>
          ) : (
            <ul className="list">
              {visible.map((t, i) => (
                <TaskItem key={t.id} task={t} index={i} onToggle={toggle} onDelete={remove} onRename={rename} />
              ))}
            </ul>
          )}
        </div>
      </main>
      <Confetti burst={burst} />
    </>
  );
}
