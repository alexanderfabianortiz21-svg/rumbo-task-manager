import { useState } from 'react';

const LABEL = { low: 'Low', medium: 'Medium', high: 'High' };
const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function formatDue(due, done) {
  const label = new Date(`${due}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const today = localISO(new Date());
  if (done) return { text: label, overdue: false };
  if (due < today) return { text: `Overdue, ${label}`, overdue: true };
  if (due === today) return { text: 'Due today', overdue: false };
  return { text: `Due ${label}`, overdue: false };
}

export default function TaskItem({ task, index, onToggle, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [leaving, setLeaving] = useState(false);
  const due = task.due_date ? formatDue(task.due_date, task.done) : null;

  const save = () => {
    const next = title.trim();
    setEditing(false);
    if (next && next !== task.title) onRename(task.id, next);
    else setTitle(task.title);
  };

  const remove = () => {
    setLeaving(true);
    setTimeout(() => onDelete(task.id), 260);
  };

  return (
    <li
      className={`task ${task.priority} ${task.done ? 'is-done' : ''} ${leaving ? 'leaving' : ''}`}
      style={{ '--i': index }}
    >
      <button
        className="check"
        role="checkbox"
        aria-checked={task.done}
        aria-label={`${task.done ? 'Reopen' : 'Complete'}: ${task.title}`}
        onClick={() => onToggle(task)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 12.5l4 4 8-9" pathLength="1" />
        </svg>
      </button>

      <div className="task-body">
        {editing ? (
          <input
            className="edit"
            value={title}
            autoFocus
            maxLength={200}
            aria-label="Edit task title"
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') { setTitle(task.title); setEditing(false); }
            }}
          />
        ) : (
          <span className="title" onDoubleClick={() => setEditing(true)}>{task.title}</span>
        )}
        <span className="meta">
          <span className="prio-label">{LABEL[task.priority]} priority</span>
          {due && <span className={due.overdue ? 'due overdue' : 'due'}>{due.text}</span>}
        </span>
      </div>

      <div className="actions">
        <button className="icon" onClick={() => setEditing(true)} aria-label="Edit task">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z M13.5 6.5l4 4" /></svg>
        </button>
        <button className="icon danger" onClick={remove} aria-label="Delete task">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14 M10 7V5h4v2 M7 7l1 12h8l1-12 M10 11v5 M14 11v5" /></svg>
        </button>
      </div>
    </li>
  );
}
