/* ═══════════════════════════════════════════════════════════════════════════
   CloudNotes — Frontend Application
   Platform as a Service · Google App Engine
   ═══════════════════════════════════════════════════════════════════════════ */

const API_BASE = '/api/notes';
let selectedColor = '#6c5ce7';
let editingId = null;

// ─── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initColorPicker();
  fetchNotes();
  updateSyncTime();

  // Keyboard shortcut: Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

// ─── API Functions ──────────────────────────────────────────────────────────

async function fetchNotes() {
  try {
    const res = await fetch(API_BASE);
    const json = await res.json();

    if (json.success) {
      renderNotes(json.data);
      document.getElementById('stat-total').textContent = json.count;
      updateSyncTime();
    }
  } catch (err) {
    console.error('Failed to fetch notes:', err);
    showToast('Failed to load notes', 'error');
  }
}

async function createNote(data) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.success) {
      showToast('Note created successfully!', 'success');
      fetchNotes();
      return true;
    } else {
      showToast(json.message || 'Failed to create note', 'error');
      return false;
    }
  } catch (err) {
    console.error('Failed to create note:', err);
    showToast('Network error — could not create note', 'error');
    return false;
  }
}

async function updateNote(id, data) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.success) {
      showToast('Note updated successfully!', 'success');
      fetchNotes();
      return true;
    } else {
      showToast(json.message || 'Failed to update note', 'error');
      return false;
    }
  } catch (err) {
    console.error('Failed to update note:', err);
    showToast('Network error — could not update note', 'error');
    return false;
  }
}

async function deleteNote(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (json.success) {
      showToast('Note deleted', 'success');
      fetchNotes();
    } else {
      showToast(json.message || 'Failed to delete note', 'error');
    }
  } catch (err) {
    console.error('Failed to delete note:', err);
    showToast('Network error — could not delete note', 'error');
  }
}

// ─── Rendering ──────────────────────────────────────────────────────────────

function renderNotes(notes) {
  const grid = document.getElementById('notes-grid');
  const emptyState = document.getElementById('empty-state');

  if (notes.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  grid.innerHTML = notes.map((note, i) => `
    <div class="note-card" style="--note-color: ${note.color}; animation-delay: ${i * 0.05}s">
      <div class="note-header">
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <div class="note-actions">
          <button class="btn-icon" onclick="editNote('${note.id}')" title="Edit note" aria-label="Edit note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </button>
          <button class="btn-icon danger" onclick="confirmDelete('${note.id}', '${escapeHtml(note.title).replace(/'/g, "\\'")}')" title="Delete note" aria-label="Delete note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      ${note.content ? `<p class="note-content">${escapeHtml(note.content)}</p>` : ''}
      <div class="note-footer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>${formatDate(note.updatedAt)}</span>
      </div>
    </div>
  `).join('');
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function openModal(note = null) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('note-form');
  const submitBtn = document.getElementById('btn-submit');

  form.reset();
  editingId = null;

  if (note) {
    // Edit mode
    editingId = note.id;
    title.textContent = 'Edit Note';
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      Update Note
    `;
    document.getElementById('note-id').value = note.id;
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content || '';
    setActiveColor(note.color);
  } else {
    // Create mode
    title.textContent = 'Create New Note';
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      Save Note
    `;
    setActiveColor('#6c5ce7');
  }

  overlay.classList.add('active');
  setTimeout(() => document.getElementById('note-title').focus(), 200);
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('active');
  editingId = null;
}

async function handleSubmit(event) {
  event.preventDefault();

  const data = {
    title: document.getElementById('note-title').value,
    content: document.getElementById('note-content').value,
    color: selectedColor
  };

  let success;
  if (editingId) {
    success = await updateNote(editingId, data);
  } else {
    success = await createNote(data);
  }

  if (success) {
    closeModal();
  }
}

// ─── Edit & Delete ──────────────────────────────────────────────────────────

async function editNote(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();
    if (json.success) {
      openModal(json.data);
    }
  } catch (err) {
    showToast('Failed to load note for editing', 'error');
  }
}

function confirmDelete(id, title) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-delete-overlay';
  overlay.innerHTML = `
    <div class="confirm-delete-box">
      <h3>Delete Note?</h3>
      <p>Are you sure you want to delete "<strong>${title}</strong>"? This action cannot be undone.</p>
      <div class="confirm-delete-actions">
        <button class="btn btn-ghost" id="cancel-delete">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-btn">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#cancel-delete').onclick = () => overlay.remove();
  overlay.querySelector('#confirm-delete-btn').onclick = () => {
    overlay.remove();
    deleteNote(id);
  };
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// ─── Color Picker ───────────────────────────────────────────────────────────

function initColorPicker() {
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      setActiveColor(swatch.dataset.color);
    });
  });
}

function setActiveColor(color) {
  selectedColor = color;
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === color);
  });
}

// ─── Toast Notifications ────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function updateSyncTime() {
  const el = document.getElementById('stat-uptime');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
