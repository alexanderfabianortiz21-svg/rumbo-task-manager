# Rumbo

**Plan your day. Watch the sun rise as you finish it.**

Rumbo is a full-stack task manager. A sunrise sits at the top of the screen and climbs the horizon as you complete tasks. Finish the last one and the day celebrates with you.

## Features
- Create, edit (double-click), complete and delete tasks
- Priority levels with colour-coded edges, and due dates with overdue highlighting
- Live progress "horizon": the sky and sun animate with your completion rate
- Animated filters, check-offs and a confetti moment when everything is done
- Server-side validation with clear error messages
- Responsive, keyboard accessible, respects `prefers-reduced-motion`

## Tech stack
React 18, Vite, Node.js, Express, SQLite (better-sqlite3)

## API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task `{ title, priority, due_date }` |
| PATCH | `/api/tasks/:id` | Update `title`, `priority`, `due_date` or `done` |
| DELETE | `/api/tasks/:id` | Delete a task |

## Run locally
```bash
npm install
npm --prefix client install
npm run dev:server     # API on http://localhost:3001
npm run dev:client     # App on http://localhost:5173 (second terminal)
```

## Production build
```bash
npm install && npm run build
npm start              # serves API + built React app on one port
```

## Deploy on Render
1. Push this repo to GitHub.
2. Create a **Web Service** from the repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Optional: add a persistent disk and set `DB_PATH=/data/tasks.db` so tasks survive restarts.
