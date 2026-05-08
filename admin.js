// DesignEase Admin JS — admin.js

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('admin-toast');
  if (!t) return;
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = `show ${type}`;
  setTimeout(() => t.className = '', 3000);
}

// ── ACTIVE NAV ────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  if (item.href === window.location.href) {
    item.classList.add('active');
  }
});

// ── CLOCK ─────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ── MODAL ─────────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ── CONFIRM DELETE ─────────────────────────────────────────────
function confirmDelete(msg, callback) {
  if (confirm(msg || 'Are you sure?')) callback();
}

// ── CHART DEFAULTS ─────────────────────────────────────────────
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#7a7f9a';
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.font.size = 12;

  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
  Chart.defaults.plugins.legend.labels.padding = 16;

  Chart.defaults.plugins.tooltip.backgroundColor = '#1a1d27';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.07)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.titleColor = '#e8eaf0';
  Chart.defaults.plugins.tooltip.bodyColor = '#7a7f9a';
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };

  Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.04)';
  Chart.defaults.scale.grid.drawBorder = false;
  Chart.defaults.scale.ticks.padding = 8;
}

// ── ANIMATE COUNTERS ───────────────────────────────────────────
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString();
  }, 16);
}

document.querySelectorAll('.stat-value[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count);
  animateCounter(el, target);
});

// ── TOGGLE ────────────────────────────────────────────────────
document.querySelectorAll('.toggle input').forEach(toggle => {
  toggle.addEventListener('change', function() {
    const label = this.closest('.toggle-wrap')?.querySelector('.toggle-label');
    if (label) {
      const name = label.dataset.feature || 'Feature';
      showToast(`${name} ${this.checked ? 'enabled' : 'disabled'}`);
    }
  });
});

// ── TABLE SEARCH ──────────────────────────────────────────────
function filterTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}