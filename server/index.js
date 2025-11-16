import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dbFile = path.join(dataDir, 'db.json');

function ensureStorage() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ activities: [], searches: [], learnings: [] }, null, 2));
  }
}

function readDb() {
  ensureStorage();
  const raw = fs.readFileSync(dbFile, 'utf8');
  return JSON.parse(raw);
}

function writeDb(db) {
  ensureStorage();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Generic helpers
function appendAndReturn(collectionName, item) {
  const db = readDb();
  const withId = { id: `${collectionName}-${Date.now()}`, ts: new Date().toISOString(), ...item };
  db[collectionName].push(withId);
  writeDb(db);
  return withId;
}

function getAll(collectionName) {
  const db = readDb();
  return db[collectionName] || [];
}

// Activity
app.post('/api/activity', (req, res) => {
  const { type, detail, metadata } = req.body || {};
  const saved = appendAndReturn('activities', { type, detail, metadata });
  res.status(201).json(saved);
});
app.get('/api/activity', (_req, res) => {
  res.json(getAll('activities'));
});

// Searches
app.post('/api/searches', (req, res) => {
  const { query, resultsCount, source } = req.body || {};
  const saved = appendAndReturn('searches', { query, resultsCount, source });
  res.status(201).json(saved);
});
app.get('/api/searches', (_req, res) => {
  res.json(getAll('searches'));
});

// Learnings
app.post('/api/learnings', (req, res) => {
  const { title, content, tags } = req.body || {};
  const saved = appendAndReturn('learnings', { title, content, tags });
  res.status(201).json(saved);
});
app.get('/api/learnings', (_req, res) => {
  res.json(getAll('learnings'));
});

app.listen(PORT, () => {
  ensureStorage();
  console.log(`Analytics server listening on http://localhost:${PORT}`);
});





