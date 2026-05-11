// frontend/js/auth.js
// Fase 6 - Autenticacion JWT en el frontend
// Gestiona login, logout y adjunta el token a las peticiones de escritura

// Token en sessionStorage: se borra al cerrar el navegador (mas seguro que localStorage)
const AUTH = {
    get token()    { return sessionStorage.getItem('siem_token'); },
    set token(t)   { sessionStorage.setItem('siem_token', t); },
    clear()        { sessionStorage.removeItem('siem_token'); sessionStorage.removeItem('siem_user'); },
    get usuario()  { return sessionStorage.getItem('siem_user'); },
    set usuario(u) { sessionStorage.setItem('siem_user', u); },
};

// Referencias DOM
const loginOverlay = document.getElementById('loginOverlay');
const loginForm    = document.getElementById('loginForm');
const loginUser    = document.getElementById('loginUser');
const loginPass    = document.getElementById('loginPass');
const loginError   = document.getElementById('loginError');
const btnLogin     = document.getElementById('btnLogin');
const btnLogout    = document.getElementById('btnLogout');
const authBar      = document.getElementById('authBar');
const authUserEl   = document.getElementById('authUser');

// Mostrar/ocultar UI segun estado de autenticacion
function actualizarUI() {
    if (AUTH.token) {
          loginOverlay.style.display = 'none';
          authBar.style.display      = 'flex';
          authUserEl.textContent     = AUTH.usuario ? `Operador: ${AUTH.usuario}` : 'Sesion activa';
    } else {
          loginOverlay.style.display = 'flex';
          authBar.style.display      = 'none';
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

                             const usuario  = loginUser.value.trim();
    const password = loginPass.value;

                             loginError.style.display = 'none';
    btnLogin.disabled        = true;
    btnLogin.textContent     = 'Verificando...';

                             try {
                                   const res = await fetch('/api/auth/login', {
                                           method:  'POST',
                                           headers: { 'Content-Type': 'application/json' },
                                           body:    JSON.stringify({ usuario, password }),
                                   });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error de autenticacion');

      AUTH.token   = data.token;
                                   AUTH.usuario = data.usuario;
                                   loginPass.value = '';
                                   actualizarUI();

                             } catch (err) {
                                   loginError.textContent   = err.message;
                                   loginError.style.display = 'block';
                                   loginPass.value = '';
                             } finally {
                                   btnLogin.disabled    = false;
                                   btnLogin.textContent = 'Iniciar sesion';
                             }
});

// Logout
btnLogout.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    AUTH.clear();
    actualizarUI();
});

// Helper global: fetch autenticado para peticiones de escritura (POST, PATCH, DELETE)
// app.js usa window.fetchAuth(...) en lugar de fetch(...) para esas peticiones
window.fetchAuth = function(url, options = {}) {
    if (!AUTH.token) {
          actualizarUI(); // Mostrar login si no hay token
      return Promise.reject(new Error('No autenticado. Inicia sesion primero.'));
    }

    return fetch(url, {
          ...options,
          headers: {
                  ...options.headers,
                  'Authorization': `Bearer ${AUTH.token}`,
          },
    }).then(res => {
          // Si el token expiro (401), forzar nuevo login
                if (res.status === 401) {
                        AUTH.clear();
                        actualizarUI();
                        throw new Error('Sesion expirada. Inicia sesion de nuevo.');
                }
          return res;
    });
};

// Inicializar estado de UI al cargar la pagina
actualizarUI();
