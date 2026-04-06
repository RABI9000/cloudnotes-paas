const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-Memory Data Store ───────────────────────────────────────────────────
let notes = [
  {
    id: uuidv4(),
    title: 'Welcome to CloudNotes ☁️',
    content: 'This app is running on Google App Engine — a Platform as a Service (PaaS) by Google Cloud. Try creating, editing, or deleting notes!',
    color: '#6c5ce7',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'What is PaaS?',
    content: 'Platform as a Service abstracts away Infrastructure management. You focus on code — the platform handles servers, scaling, networking, and OS patches automatically.',
    color: '#00b894',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    title: 'Key PaaS Benefits',
    content: '• Auto-scaling based on traffic\n• Zero server management\n• Built-in load balancing\n• Pay-per-use pricing\n• Rapid deployment with simple CLI commands',
    color: '#e17055',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ─── API Routes ─────────────────────────────────────────────────────────────

// Health check (used by App Engine)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CloudNotes PaaS',
    timestamp: new Date().toISOString(),
    platform: 'Google App Engine',
    noteCount: notes.length
  });
});

// GET all notes
app.get('/api/notes', (req, res) => {
  const sorted = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json({ success: true, data: sorted, count: sorted.length });
});

// GET single note
app.get('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  res.json({ success: true, data: note });
});

// POST create note
app.post('/api/notes', (req, res) => {
  const { title, content, color } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const note = {
    id: uuidv4(),
    title: title.trim(),
    content: (content || '').trim(),
    color: color || '#6c5ce7',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.push(note);
  res.status(201).json({ success: true, data: note, message: 'Note created' });
});

// PUT update note
app.put('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  const { title, content, color } = req.body;
  if (title !== undefined) notes[idx].title = title.trim();
  if (content !== undefined) notes[idx].content = content.trim();
  if (color !== undefined) notes[idx].color = color;
  notes[idx].updatedAt = new Date().toISOString();

  res.json({ success: true, data: notes[idx], message: 'Note updated' });
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  const deleted = notes.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Note deleted' });
});

// Serve the SPA for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   ☁️  CloudNotes PaaS — Server Running       ║
  ║   🌐 http://localhost:${PORT}                 ║
  ║   📦 Platform: Google App Engine (PaaS)      ║
  ╚══════════════════════════════════════════════╝
  `);
});
