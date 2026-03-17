// app.js — Mini-SIEM Personal · Fase 3: Dashboard en vivo
// Conecta con la API REST y renderiza las alertas en tiempo real

const API = '/api/alertas';

// ── Estado de la app ──────────────────────────────────────────────────────────
const state = {
  pagina: 1,
  limite: 15,
  filtros: {},
  alertaActiva: null,
};

// ── Referencias DOM ───────────────────────────────────────────────────────────
const tablaBody           = document.getElementById('tablaBody');
const paginacion          = document.getElementById('paginacion');
const filtroSeveridad     = document.getElementById('filtroSeveridad');
const filtroEstado        = document.getElementById('filtroEstado');
const filtroTipo          = document.getElementById('filtroTipo');
const btnLimpiar          = document.getElementById('btnLimpiar');
const btnRefrescar        = document.getElementById('btnRefrescar');
const contadorResultados  = document.getElementById('contadorResultados');
const modalOverlay        = document.getElementById('modalOverlay');
const modalClose          = document.getElementById('modalClose');
const modalBody           = document.getElementById('modalBody');
const modalEstado         = document.getElementById('modalEstado');
const btnGuardarEstado    = document.getElementById('btnGuardarEstado');
const statusDot           = document.getElementById('statusDot');
const statusText          = document.getElementById('statusText');

// ── Reloj en tiempo real ──────────────────────────────────────────────────────
function actualizarReloj() {
  const ahora = new Date();
  document.getElementById('reloj').textContent =
    ahora.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}
actualizarReloj();
setInterval(actualizarReloj, 1000);

// ── Comprobar estado de la API ────────────────────────────────────────────────
async function comprobarEstado() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const ok = data.status === 'OK' && data.db === 'conectado';
    statusDot.className  = `status-dot ${ok ? 'ok' : 'error'}`;
    statusText.textContent = ok ? 'API · MongoDB OK' : 'Sin conexión';
  } catch {
    statusDot.className  = 'status-dot error';
    statusText.textContent = 'API no disponible';
  }
}
comprobarEstado();
setInterval(comprobarEstado, 30_000);

// ── Cargar estadísticas (cards superiores) ────────────────────────────────────
async function cargarStats() {
  try {
    const res = await fetch(`${API}/stats`);
    const data = await res.json();

    document.getElementById('statTotal').textContent = data.total ?? '—';

    const sev = {};
    (data.por_severidad || []).forEach(s => { sev[s._id] = s.total; });
    document.getElementById('statCritica').textContent = sev['Crítica'] ?? 0;
    document.getElementById('statAlta').textContent    = sev['Alta']    ?? 0;
    document.getElementById('statMedia').textContent   = sev['Media']   ?? 0;
    document.getElementById('statBaja').textContent    = sev['Baja']    ?? 0;

    const est = {};
    (data.por_estado || []).forEach(e => { est[e._id] = e.total; });
    document.getElementById('statNueva').textContent = est['Nueva'] ?? 0;

  } catch (err) {
    console.error('Error cargando stats:', err);
  }
}

// ── Formatear timestamp ───────────────────────────────────────────────────────
function formatTs(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Badge de severidad ────────────────────────────────────────────────────────
function badgeSeveridad(sev) {
  const mapa = {
    'Crítica': 'critica',
    'Alta':    'alta',
    'Media':   'media',
    'Baja':    'baja',
  };
  const cls = mapa[sev] || 'baja';
  return `<span class="badge badge-${cls}">${sev.toUpperCase()}</span>`;
}

// ── Badge de estado ───────────────────────────────────────────────────────────
function badgeEstado(estado) {
  const mapa = {
    'Nueva':           'Nueva',
    'En revisión':     'revision',
    'Resuelta':        'Resuelta',
    'Falso positivo':  'falso',
  };
  const cls = mapa[estado] || 'falso';
  return `<span class="estado-badge estado-${cls}">${estado}</span>`;
}

// ── Truncar texto largo ───────────────────────────────────────────────────────
function truncar(texto, max = 90) {
  if (!texto) return '—';
  return texto.length > max ? texto.slice(0, max) + '…' : texto;
}

// ── Cargar y renderizar alertas ───────────────────────────────────────────────
async function cargarAlertas() {
  // Mostrar loading
  tablaBody.innerHTML = `
    <tr class="loading-row">
      <td colspan="9">
        <div class="loading-msg">
          <span class="spinner"></span>
          Cargando alertas...
        </div>
      </td>
    </tr>`;

  // Construir query string con filtros y paginación
  const params = new URLSearchParams({
    pagina: state.pagina,
    limite: state.limite,
    ...state.filtros,
  });

  try {
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    renderizarTabla(data.datos || []);
    renderizarPaginacion(data);
    contadorResultados.textContent = `${data.total} resultado${data.total !== 1 ? 's' : ''}`;

  } catch (err) {
    tablaBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="9">⚠ Error al conectar con la API: ${err.message}</td>
      </tr>`;
    console.error(err);
  }
}

// ── Renderizar filas de la tabla ──────────────────────────────────────────────
function renderizarTabla(alertas) {
  if (alertas.length === 0) {
    tablaBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="9">No se encontraron alertas con los filtros aplicados.</td>
      </tr>`;
    return;
  }

  tablaBody.innerHTML = alertas.map(a => `
    <tr data-id="${a._id}">
      <td class="col-ts">${formatTs(a.timestamp)}</td>
      <td>${badgeSeveridad(a.severidad)}</td>
      <td>${a.tipo || '—'}</td>
      <td class="col-ip mono">${a.origen_ip || '—'}</td>
      <td class="col-dispositivo">${a.dispositivo || '—'}</td>
      <td class="col-desc">${truncar(a.descripcion)}</td>
      <td>${badgeEstado(a.estado)}</td>
      <td class="col-operador">${a.operador || '—'}</td>
      <td>
        <button class="btn-row" data-id="${a._id}">Ver</button>
      </td>
    </tr>
  `).join('');

  // Click en fila → abrir modal
  tablaBody.querySelectorAll('tr[data-id]').forEach(fila => {
    fila.addEventListener('click', () => abrirModal(fila.dataset.id));
  });
}

// ── Renderizar paginación ─────────────────────────────────────────────────────
function renderizarPaginacion({ pagina, paginas }) {
  if (!paginas || paginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }

  let html = `
    <button class="page-btn" onclick="irPagina(${pagina - 1})" ${pagina <= 1 ? 'disabled' : ''}>‹ Ant</button>
  `;

  for (let i = 1; i <= paginas; i++) {
    if (
      i === 1 || i === paginas ||
      (i >= pagina - 2 && i <= pagina + 2)
    ) {
      html += `<button class="page-btn ${i === pagina ? 'active' : ''}" onclick="irPagina(${i})">${i}</button>`;
    } else if (i === pagina - 3 || i === pagina + 3) {
      html += `<span style="color:var(--text-muted);padding:0 4px">…</span>`;
    }
  }

  html += `
    <button class="page-btn" onclick="irPagina(${pagina + 1})" ${pagina >= paginas ? 'disabled' : ''}>Sig ›</button>
  `;

  paginacion.innerHTML = html;
}

function irPagina(n) {
  state.pagina = n;
  cargarAlertas();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── MODAL: abrir detalle de alerta ────────────────────────────────────────────
async function abrirModal(id) {
  state.alertaActiva = id;
  modalBody.innerHTML = '<div class="loading-msg"><span class="spinner"></span></div>';
  modalOverlay.classList.add('open');

  try {
    const res = await fetch(`${API}/${id}`);
    const a = await res.json();

    modalBody.innerHTML = `
      <div class="modal-field">
        <span class="modal-field-label">TIMESTAMP</span>
        <span class="modal-field-value mono">${formatTs(a.timestamp)}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">SEVERIDAD</span>
        <span class="modal-field-value">${badgeSeveridad(a.severidad)}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">TIPO</span>
        <span class="modal-field-value">${a.tipo}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">ESTADO</span>
        <span class="modal-field-value">${badgeEstado(a.estado)}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">ORIGEN IP</span>
        <span class="modal-field-value mono">${a.origen_ip}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">DISPOSITIVO</span>
        <span class="modal-field-value mono">${a.dispositivo}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">OPERADOR</span>
        <span class="modal-field-value mono">${a.operador || '—'}</span>
      </div>
      <div class="modal-field">
        <span class="modal-field-label">ID MONGODB</span>
        <span class="modal-field-value mono" style="font-size:0.68rem;color:var(--text-muted)">${a._id}</span>
      </div>
      <div class="modal-field full">
        <span class="modal-field-label">DESCRIPCIÓN</span>
        <span class="modal-field-value">${a.descripcion}</span>
      </div>
    `;

    // Pre-seleccionar estado actual en el selector del modal
    modalEstado.value = a.estado;

  } catch (err) {
    modalBody.innerHTML = `<p style="color:var(--critica)">Error al cargar alerta: ${err.message}</p>`;
  }
}

// ── MODAL: guardar cambio de estado ──────────────────────────────────────────
btnGuardarEstado.addEventListener('click', async () => {
  if (!state.alertaActiva) return;

  btnGuardarEstado.textContent = '...';
  btnGuardarEstado.disabled = true;

  try {
    const res = await fetch(`${API}/${state.alertaActiva}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: modalEstado.value }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    cerrarModal();
    await Promise.all([cargarAlertas(), cargarStats()]);

  } catch (err) {
    alert('Error al actualizar el estado: ' + err.message);
  } finally {
    btnGuardarEstado.textContent = 'Guardar';
    btnGuardarEstado.disabled = false;
  }
});

// ── MODAL: cerrar ─────────────────────────────────────────────────────────────
function cerrarModal() {
  modalOverlay.classList.remove('open');
  state.alertaActiva = null;
}

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) cerrarModal();
});

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

// ── FILTROS ───────────────────────────────────────────────────────────────────
function aplicarFiltros() {
  state.pagina = 1;
  state.filtros = {};
  if (filtroSeveridad.value) state.filtros.severidad = filtroSeveridad.value;
  if (filtroEstado.value)    state.filtros.estado    = filtroEstado.value;
  if (filtroTipo.value)      state.filtros.tipo      = filtroTipo.value;
  cargarAlertas();
}

filtroSeveridad.addEventListener('change', aplicarFiltros);
filtroEstado.addEventListener('change', aplicarFiltros);
filtroTipo.addEventListener('change', aplicarFiltros);

btnLimpiar.addEventListener('click', () => {
  filtroSeveridad.value = '';
  filtroEstado.value    = '';
  filtroTipo.value      = '';
  state.filtros = {};
  state.pagina  = 1;
  cargarAlertas();
  cargarStats();
});

btnRefrescar.addEventListener('click', () => {
  cargarAlertas();
  cargarStats();
  comprobarEstado();
});

// ── ARRANQUE ──────────────────────────────────────────────────────────────────
cargarStats();
cargarAlertas();
