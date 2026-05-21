/**
 * Helpers para VIP FLOW BOT
 * Funções compartilhadas entre todas as páginas
 */

const API_URL = 'http://localhost:3000';

// ===== AUTENTICAÇÃO =====

function getToken() {
  return localStorage.getItem('vipflow_token');
}

function isAuthenticated() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem('vipflow_token');
  localStorage.removeItem('vipflow_user');
  window.location.href = '/';
}

function checkAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/';
  }
}

// ===== FETCH HELPERS =====

async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// GET
async function get(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

// POST
async function post(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// PUT
async function put(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

// DELETE
async function del(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

// Upload de arquivo (FormData)
async function upload(endpoint, formData) {
  const token = getToken();
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        logout();
      }
      throw new Error(data.message || 'Erro no upload');
    }

    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}

// ===== DOM HELPERS =====

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function showMessage(text, type = 'info', duration = 5000) {
  const container = $('#messageContainer') || createMessageContainer();
  const html = `<div class="alert alert-${type}" id="message">${text}</div>`;
  container.innerHTML = html;

  if (duration > 0) {
    setTimeout(() => {
      const msg = $('#message');
      if (msg) msg.remove();
    }, duration);
  }
}

function createMessageContainer() {
  const container = document.createElement('div');
  container.id = 'messageContainer';
  document.body.insertBefore(container, document.body.firstChild);
  return container;
}

function showLoading(show = true) {
  const main = $('.main');
  if (show) {
    main.style.opacity = '0.5';
    main.style.pointerEvents = 'none';
  } else {
    main.style.opacity = '1';
    main.style.pointerEvents = 'auto';
  }
}

// ===== NAV HELPERS =====

function setActiveNav(pageName) {
  $$('.nav-item').forEach(item => item.classList.remove('active'));
  const active = $(`.nav-item[data-page="${pageName}"]`);
  if (active) active.classList.add('active');
}

// ===== FORMATO DE DADOS =====

function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getStatusBadge(status) {
  const badges = {
    'sent': { class: 'badge-success', text: '✅ Enviado' },
    'pending': { class: 'badge-warning', text: '⏳ Pendente' },
    'failed': { class: 'badge-danger', text: '❌ Erro' },
    'active': { class: 'badge-success', text: '✅ Ativo' },
    'paused': { class: 'badge-warning', text: '⏸️ Pausado' }
  };
  const badge = badges[status] || { class: 'badge-info', text: status };
  return `<span class="badge ${badge.class}">${badge.text}</span>`;
}

// ===== LOADING SPINNER =====

function createSpinner(size = 'small') {
  const sizes = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };
  const div = document.createElement('div');
  div.className = 'loading';
  div.style.width = sizes[size];
  div.style.height = sizes[size];
  return div;
}

// ===== INICIALIZAÇÃO =====

function initPage(pageName) {
  checkAuth();
  setActiveNav(pageName);
  loadUserInfo();
  loadSystemStatus();
}

async function loadSystemStatus() {
  try {
    const data = await get('/api/system/status');
    const status = data.system;

    // Adicionar badge no sidebar
    const sidebar = $('.sidebar-header');
    if (sidebar) {
      let badgeColor = status.testModeActive ? '#f59e0b' : '#ef4444';
      let badgeText = status.testModeActive ? '🧪 TESTE' : '🔴 PRODUÇÃO';

      let badge = sidebar.querySelector('.mode-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'mode-badge';
        sidebar.appendChild(badge);
      }

      badge.innerHTML = `<span style="background: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-top: 8px; display: inline-block;">${badgeText}</span>`;
    }
  } catch (error) {
    console.error('Erro ao carregar status:', error);
  }
}

async function loadUserInfo() {
  try {
    const data = await get('/api/auth/me');
    const email = data.user?.email || 'Usuário';
    const footer = $('.sidebar-footer');
    if (footer) {
      const userInfo = footer.querySelector('.user-info');
      if (userInfo) {
        userInfo.innerHTML = `<strong>${email}</strong><small>${new Date().toLocaleDateString('pt-BR')}</small>`;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
  }
}

// ===== TEMPLATE HELPERS =====

function truncate(text, length = 50) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function getStrategyEmoji(strategy) {
  const emojis = {
    'curiosidade': '🔍',
    'exclusividade': '👑',
    'urgencia': '⏰',
    'oferta': '💰',
    'novidade': '✨',
    'suave': '💝',
    'cta': '🎯'
  };
  return emojis[strategy] || '📌';
}

function getPhotoTypeEmoji(type) {
  const emojis = {
    'previa': '👀',
    'destaque': '⭐',
    'oferta': '🎁',
    'novidade': '🆕'
  };
  return emojis[type] || '📷';
}

// ===== EXPORT =====

// Tudo já está no escopo global
