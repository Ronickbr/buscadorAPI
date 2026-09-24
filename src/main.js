import { resultMarkup, bindResultTabs } from './results-view.js';
import { formatResultText } from './format-result.js';
import { CATEGORIES, ENDPOINTS } from './endpoints.js';

const CATEGORY_ICONS = {"all":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/></svg>","pessoas":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21v-2a8 8 0 0 1 16 0v2\"/></svg>","telefones":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"6\" y=\"2\" width=\"12\" height=\"20\" rx=\"2\"/><path d=\"M10 18h4\"/></svg>","veiculos":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m5 7 2-4h10l2 4 2 4v7H3v-7Z M3 11h18 M6 18v3 M18 18v3 M6 14h2 M16 14h2\"/></svg>","credito":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20 M6 15h4\"/></svg>","fotos":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><path d=\"m3 17 6-6 4 4 3-3 5 5\"/></svg>","trabalho":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3\" y=\"7\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M8 7V3h8v4 M3 13h18 M10 13v3h4v-3\"/></svg>","completa":"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"10\" cy=\"10\" r=\"7\"/><path d=\"m15 15 6 6\"/></svg>"};
// State Management
let currentCategory = 'all';
let currentSearch = '';
let selectedEndpoint = null;
let queryHistory = [];
try { const saved = JSON.parse(localStorage.getItem('api_query_history') || '[]'); if (Array.isArray(saved)) queryHistory = saved.filter(x => x && typeof x === 'object').slice(0,30); } catch {} 
let currentResponseData = null;
let viewMode = 'visual'; // 'visual' | 'raw'

// API Status Tracker
const apiStatus = {}; // item.id -> 'online' | 'offline' | 'checking'

// Key Label Translator Dictionary
const FIELD_LABELS = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  nome: 'Nome Completo',
  nome_mae: 'Nome da Mãe',
  mae: 'Nome da Mãe',
  pai: 'Nome do Pai',
  rg: 'Registro Geral (RG)',
  orgao_emissor: 'Órgão Emissor',
  uf_emissor: 'UF do RG',
  nascimento: 'Data de Nascimento',
  data_nascimento: 'Data de Nascimento',
  sexo: 'Gênero / Sexo',
  estado_civil: 'Estado Civil',
  situacao: 'Situação Cadastral',
  situacao_cadastral: 'Situação Cadastral',
  renda: 'Renda Estimada',
  renda_estimada: 'Renda Estimada',
  telefone: 'Telefone Principal',
  telefones: 'Lista de Telefones',
  celular: 'Número Celular',
  email: 'E-mail',
  emails: 'Endereços de E-mail',
  endereco: 'Endereço',
  bairro: 'Bairro',
  cidade: 'Cidade',
  uf: 'Estado (UF)',
  cep: 'CEP',
  pis: 'PIS / PASEP',
  titulo_eleitor: 'Título de Eleitor',
  parentes: 'Parentes Próximos',
  cpf_parente: 'CPF do Parente',
  placa: 'Placa Veicular',
  chassi: 'Chassi',
  renavam: 'Renavam',
  renavan: 'Renavam',
  marca: 'Marca / Modelo',
  modelo: 'Modelo',
  cor: 'Cor do Veículo',
  ano: 'Ano de Fabricação',
  ano_modelo: 'Ano do Modelo',
  num_motor: 'Número do Motor',
  num_caixa_cambio: 'Caixa de Câmbio',
  erro: 'Mensagem do Servidor',
  status: 'Status da Consulta',
  mensagem: 'Observação'
};

// DOM Elements
const categoryNavEl = document.getElementById('categoryNav');
const endpointsGridEl = document.getElementById('endpointsGrid');
const currentCategoryTitleEl = document.getElementById('currentCategoryTitle');
const apiCountBadgeEl = document.getElementById('apiCountBadge');
const globalSearchInput = document.getElementById('globalSearch');

// Executor Elements
const selectedApiNameEl = document.getElementById('selectedApiName');
const selectedApiDescEl = document.getElementById('selectedApiDesc');
const queryFormEl = document.getElementById('queryForm');
const examplesContainerEl = document.getElementById('examplesContainer');
const btnExecuteQuery = document.getElementById('btnExecuteQuery');

// Response Elements
const responseStatusBadge = document.getElementById('responseStatusBadge');
const responseTimeBadge = document.getElementById('responseTimeBadge');
const responseBodyEl = document.getElementById('responseBody');
const btnViewVisual = document.getElementById('btnViewVisual');
const btnViewRaw = document.getElementById('btnViewRaw');
const btnCopyJson = document.getElementById('btnCopyJson');
const btnDownloadJson = document.getElementById('btnDownloadJson');

// History Elements
const btnToggleHistory = document.getElementById('btnToggleHistory');
const historyDrawer = document.getElementById('historyDrawer');
const btnCloseHistory = document.getElementById('btnCloseHistory');
const historyListEl = document.getElementById('historyList');
const historyCountEl = document.getElementById('historyCount');
const btnClearHistory = document.getElementById('btnClearHistory');
const toastContainer = document.getElementById('toastContainer');

// Initialize Application
function init() {
  renderCategoryNav();
  renderEndpoints();
  renderHistory();
  setupEventListeners();

  if (ENDPOINTS.length > 0) {
    selectEndpoint(ENDPOINTS[0]);
  }

  // Iniciar teste automático das APIs
  checkAllApisStatus();
}

async function checkAllApisStatus() {
  for (const endpoint of ENDPOINTS) {
    apiStatus[endpoint.id] = 'checking';
    // Atualiza apenas a bolinha no card correspondente, se visível
    updateCardStatusVisual(endpoint.id);
    
    try {
      const proxyUrl = `/api-proxy/${endpoint.endpoint}`;
      // Faz um request rápido (HEAD) apenas para ver se o proxy e o destino respondem
      const res = await fetch(proxyUrl, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      // Se respondeu, consideramos online (mesmo que retorne erro de falta de parâmetro)
      apiStatus[endpoint.id] = (res.status >= 200 && res.status < 500) ? 'online' : 'offline';
    } catch (err) {
      apiStatus[endpoint.id] = 'offline';
    }
    updateCardStatusVisual(endpoint.id);
  }
}

function updateCardStatusVisual(id) {
  const card = document.querySelector(`.api-card[data-id="${id}"]`);
  if (!card) return;
  
  const status = apiStatus[id];
  card.classList.remove('status-online', 'status-offline', 'status-checking');
  if (status) {
    card.classList.add(`status-${status}`);
  }
}

// Render Sidebar Navigation
function renderCategoryNav() {
  categoryNavEl.innerHTML = CATEGORIES.map(cat => {
    const count = cat.id === 'all' 
      ? ENDPOINTS.length 
      : ENDPOINTS.filter(e => e.category === cat.id).length;

    return `
      <li><button type="button" aria-pressed="${cat.id === currentCategory}" class="nav-item ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
        <span class="icon">${CATEGORY_ICONS[cat.id]}</span>
        <span>${cat.name}</span>
        <span class="count-badge">${count}</span>
      </button></li>
    `;
  }).join('');
}

// Filter and Render Endpoints Grid
function renderEndpoints() {
  const filtered = ENDPOINTS.filter(item => {
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    const searchLower = currentSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      item.name.toLowerCase().includes(searchLower) ||
      item.endpoint.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.badge.toLowerCase().includes(searchLower) ||
      item.params.some(p => p.name.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  apiCountBadgeEl.textContent = `${filtered.length} API${filtered.length !== 1 ? 's' : ''} encontrada${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    endpointsGridEl.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">🔍</span>
        <strong style="color: var(--text-main);">Nenhuma API encontrada</strong>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Tente alterar os termos da busca ou mudar a categoria selecionada.</p>
      </div>
    `;
    return;
  }

  endpointsGridEl.innerHTML = filtered.map(item => {
    const statusClass = apiStatus[item.id] ? `status-${apiStatus[item.id]}` : '';
    const statusDot = `<div class="status-indicator"></div>`;
    return `
    <button type="button" aria-pressed="${selectedEndpoint?.id === item.id}" class="api-card ${selectedEndpoint?.id === item.id ? 'selected' : ''} ${statusClass}" data-id="${item.id}">
      <div class="api-card-topline">
        <div style="display:flex;align-items:center;gap:6px;">
          ${statusDot}
          <span class="api-symbol">${CATEGORY_ICONS[item.category]}</span>
        </div>
        <span class="api-selection">${selectedEndpoint?.id === item.id ? '✓ Selecionada' : 'Selecionar ↗'}</span>
      </div>
      <div class="api-card-header">
        <span class="api-card-title">${item.name}</span>
        <span class="badge">${item.badge}</span>
      </div>
      <p class="api-card-desc">${item.description}</p>
    </button>
  `}).join('');
}

// Select Endpoint and Setup Form
function selectEndpoint(endpoint) {
  selectedEndpoint = endpoint;
  renderEndpoints();

  selectedApiNameEl.textContent = endpoint.name;
  selectedApiDescEl.textContent = endpoint.description;
  btnExecuteQuery.disabled = false;

  queryFormEl.innerHTML = endpoint.params.map(p => {
    if (p.type === 'select') {
      return `
        <div class="form-group">
          <label for="param_${p.name}">${p.label}${p.required ? ' *' : ''}</label>
          <select id="param_${p.name}" name="${p.name}">
            ${p.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </div>
      `;
    }
    return `
      <div class="form-group">
        <label for="param_${p.name}">${p.label}${p.required ? ' *' : ''}</label>
        <input 
          type="${p.type || 'text'}" 
          id="param_${p.name}" 
          name="${p.name}" 
          placeholder="${p.placeholder || ''}" 
          value=""
          autocomplete="off"
          ${p.required ? 'required' : ''}
        >
      </div>
    `;
  }).join('');

  if (endpoint.examples && endpoint.examples.length > 0) {
    examplesContainerEl.innerHTML = endpoint.examples.map((ex, idx) => `
      <button class="btn-sample" data-index="${idx}">${ex.label}</button>
    `).join('');
  } else {
    examplesContainerEl.innerHTML = '<span style="font-size: 11px; color: var(--text-dim);">Nenhum exemplo predefinido</span>';
  }

}

// Pre-fill Form with Example Data
function fillFormWithExample(exampleParams) {
  Object.keys(exampleParams).forEach(key => {
    const input = queryFormEl.querySelector(`[name="${key}"]`);
    if (input) {
      input.value = exampleParams[key];
    }
  });

  showToast('Campos preenchidos com dados de exemplo!', 'info');
}

// Execute API Query
async function executeQuery() {
  if (!selectedEndpoint || btnExecuteQuery.disabled) return;
  if (!queryFormEl.reportValidity()) return;

  const formData = new FormData(queryFormEl);
  const queryParams = new URLSearchParams();
  
  for (let [key, value] of formData.entries()) {
    if (key !== 'script' && value.trim() !== '') {
      queryParams.append(key, value.trim());
    }
  }

  const scriptName = formData.get('script') || selectedEndpoint.endpoint;
  const queryString = queryParams.toString();
  
  const proxyUrl = `/api-proxy/${scriptName}${queryString ? '?' + queryString : ''}`;
  const displayUrl = `http://apisbrasilpro.site/${scriptName}${queryString ? '?' + queryString : ''}`;

  btnExecuteQuery.disabled = true;
  btnExecuteQuery.innerHTML = '<div class="spinner"></div> Processando Consulta...';
  responseStatusBadge.className = 'status-badge idle';
  responseStatusBadge.textContent = 'Enviando Requisição...';
  responseTimeBadge.textContent = '';
  responseBodyEl.innerHTML = '<div class="empty-response"><div class="spinner" style="width:36px;height:36px;"></div><span style="color:var(--text-muted);">Consultando banco de dados no apisbrasilpro.site...</span></div>';

  const startTime = performance.now();

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const rawText = await response.text();
    let parsedData = parseResponseBody(rawText);

    currentResponseData = parsedData;

    if (response.ok) {
      responseStatusBadge.className = 'status-badge success';
      responseStatusBadge.textContent = `200 OK`;
      responseTimeBadge.textContent = `⚡ ${duration} ms`;
      renderResponseContent();
      showToast(`Consulta concluída em ${duration} ms`, 'success');

      addToHistory({
        id: Date.now(),
        apiName: selectedEndpoint.name,
        endpoint: scriptName,
        url: displayUrl,
        params: Object.fromEntries(queryParams.entries()),
        time: new Date().toLocaleTimeString('pt-BR'),
        status: response.status,
        duration
      });
    } else {
      responseStatusBadge.className = 'status-badge error';
      responseStatusBadge.textContent = `HTTP ${response.status} ${response.statusText}`;
      responseTimeBadge.textContent = `${duration} ms`;
      renderResponseContent();
      showToast(`Erro na requisição: ${response.status}`, 'error');
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    responseStatusBadge.className = 'status-badge error';
    responseStatusBadge.textContent = 'FALHA NA CONEXÃO';
    responseTimeBadge.textContent = `${duration} ms`;
    
    currentResponseData = { error: error.message, detail: 'Falha ao conectar com o servidor proxy ou API externa.' };
    renderResponseContent();
    showToast('Erro de conexão ou CORS ao acessar a API', 'error');
  } finally {
    btnExecuteQuery.disabled = false;
    btnExecuteQuery.innerHTML = 'Consultar agora →';
  }
}

// Parse Raw Server Output (Extract embedded JSON if text header exists)
function parseResponseBody(rawText) {
  if (!rawText) return null;

  // Try direct JSON parse
  try {
    return JSON.parse(rawText);
  } catch (e) {
    // If text contains embedded JSON like "api desenvolvida por ... { ... }"
    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (err) {
        // Fallback to raw text
      }
    }
  }

  return rawText;
}

// Render Response Based on View Mode (Visual vs Raw JSON)
function renderResponseContent() {
  if (currentResponseData === null) {
    responseBodyEl.innerHTML = '<div class="empty-response"><span class="icon">📡</span><strong>Sem dados retornados</strong></div>';
    return;
  }

  if (viewMode === 'raw') {
    renderRawJson(currentResponseData);
  } else {
    renderVisualFormattedCards(currentResponseData);
  }
}

// Render Formatted Visual Data Cards (HUMAN READABLE / NÃO-JSON)
function renderVisualFormattedCards(data) {
  responseBodyEl.innerHTML = resultMarkup(data, FIELD_LABELS);
  bindResultTabs(responseBodyEl);
}

function formatKeyLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Render Raw JSON Code View (Developer Option)
function renderRawJson(data) {
  if (typeof data !== 'object' || data === null) {
    responseBodyEl.innerHTML = `<pre style="white-space: pre-wrap; font-family: var(--font-mono); color: #a8e6cf;">${escapeHtml(String(data))}</pre>`;
    return;
  }

  responseBodyEl.innerHTML = `<div class="json-tree">${createJsonTreeHTML(data)}</div>`;
  
  responseBodyEl.querySelectorAll('.json-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentNode = toggle.closest('.json-node');
      parentNode.classList.toggle('collapsed');
    });
  });
}

function createJsonTreeHTML(data) {
  if (data === null) return '<span style="color: #ff7588;">null</span>';
  if (typeof data === 'boolean') return `<span style="color: #ffb74d;">${data}</span>`;
  if (typeof data === 'number') return `<span style="color: #ffb74d;">${data}</span>`;
  if (typeof data === 'string') return `<span style="color: #a8e6cf;">"${escapeHtml(data)}"</span>`;

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);

  if (keys.length === 0) return isArray ? '[]' : '{}';

  let html = `<span class="json-toggle" style="cursor:pointer; color:var(--primary-hover); font-weight:bold;">${isArray ? '[' : '{'}</span>`;
  html += `<div class="json-node-body" style="padding-left: 18px;">`;

  keys.forEach((key, index) => {
    const value = data[key];
    const isLast = index === keys.length - 1;

    html += `<div class="json-node" style="margin: 2px 0;">`;
    if (!isArray) {
      html += `<span style="color: #9ebce7; font-weight:500;">"${escapeHtml(key)}"</span>: `;
    }
    html += createJsonTreeHTML(value);
    if (!isLast) html += `<span style="color: var(--text-dim); font-weight:bold;">,</span>`;
    html += `</div>`;
  });

  html += `</div><span style="color:var(--primary-hover); font-weight:bold;">${isArray ? ']' : '}'}</span>`;
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// History Logger
function addToHistory(item) {
  queryHistory.unshift(item);
  if (queryHistory.length > 30) queryHistory.pop();
  localStorage.setItem('api_query_history', JSON.stringify(queryHistory));
  renderHistory();
}

function renderHistory() {
  historyCountEl.textContent = queryHistory.length;

  if (queryHistory.length === 0) {
    historyListEl.innerHTML = '<div style="color:var(--text-dim); text-align:center; padding:30px 0; font-size:12px;">Nenhuma consulta gravada no histórico.</div>';
    return;
  }

  historyListEl.innerHTML = queryHistory.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-item-top">
        <span>${escapeHtml(item.apiName)}</span>
        <span class="history-item-time">${item.time}</span>
      </div>
      <div class="history-item-url">${escapeHtml(item.url)}</div>
      <div style="font-size:10px; color:var(--text-dim); display:flex; justify-content:space-between; margin-top:4px;">
        <span>Status: <strong style="color:var(--accent-green);">${item.status}</strong></span>
        <span>Latência: ${item.duration} ms</span>
      </div>
    </div>
  `).join('');

  historyListEl.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.id);
      const hist = queryHistory.find(h => h.id === id);
      if (hist) {
        const ep = ENDPOINTS.find(e => e.endpoint === hist.endpoint || e.name === hist.apiName);
        if (ep) selectEndpoint(ep);
        fillFormWithExample(hist.params);
        historyDrawer.classList.remove('open');
        showToast('Consulta carregada do histórico!', 'info');
      }
    });
  });
}

// Event Listeners Setup
function setupEventListeners() {
  categoryNavEl.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    currentCategory = item.dataset.category;

    const categoryObj = CATEGORIES.find(c => c.id === currentCategory);
    currentCategoryTitleEl.textContent = categoryObj.name;

    renderCategoryNav();
    renderEndpoints();
  });

  globalSearchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderEndpoints();
  });

  endpointsGridEl.addEventListener('click', (e) => {
    const card = e.target.closest('.api-card');
    if (!card) return;
    const id = card.dataset.id;
    const endpoint = ENDPOINTS.find(item => item.id === id);
    if (endpoint) {
      selectEndpoint(endpoint);
    }
  });



  examplesContainerEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-sample')) {
      const index = Number(e.target.dataset.index);
      if (selectedEndpoint && selectedEndpoint.examples[index]) {
        fillFormWithExample(selectedEndpoint.examples[index].params);
      }
    }
  });

  btnExecuteQuery.addEventListener('click', executeQuery);

  // View Mode Toggle (Visual vs Raw JSON)
  btnViewVisual.addEventListener('click', () => {
    viewMode = 'visual';
    btnViewVisual.classList.add('active');
    btnViewRaw.classList.remove('active');
    renderResponseContent();
  });

  btnViewRaw.addEventListener('click', () => {
    viewMode = 'raw';
    btnViewRaw.classList.add('active');
    btnViewVisual.classList.remove('active');
    renderResponseContent();
  });

  btnCopyJson.addEventListener('click', () => {
    if (currentResponseData === null) {
      showToast('Nenhum dado retornado para copiar!', 'error');
      return;
    }
    const textToCopy = typeof currentResponseData === 'string' ? currentResponseData : JSON.stringify(currentResponseData, null, 2);
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Conteúdo copiado para a área de transferência! 📋', 'success');
    });
  });

  btnDownloadJson.addEventListener('click', () => {
    if (currentResponseData === null) {
      showToast('Nenhum dado retornado para baixar!', 'error');
      return;
    }
    const textToDownload = 'RESULTADO DA CONSULTA\n' + '='.repeat(40) + '\n\n' + formatResultText(currentResponseData, FIELD_LABELS) + '\n';
    const blob = new Blob(['\uFEFF', textToDownload.replace(/\r?\n/g, '\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Arquivo baixado com sucesso! 💾', 'success');
  });

  btnToggleHistory.addEventListener('click', () => { historyDrawer.classList.add('open'); btnCloseHistory.focus(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && historyDrawer.classList.contains('open')) { historyDrawer.classList.remove('open'); btnToggleHistory.focus(); } });
  btnCloseHistory.addEventListener('click', () => { historyDrawer.classList.remove('open'); btnToggleHistory.focus(); });
  btnClearHistory.addEventListener('click', () => {
    queryHistory = [];
    localStorage.removeItem('api_query_history');
    renderHistory();
    showToast('Histórico de consultas limpo!', 'info');
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', init);
