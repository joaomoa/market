/**
 * Mini Bolsa para Crianças - Mercado da Sala
 * Evolução aleatória baseada no perfil de risco/retorno de cada ativo
 */

const Market = (function () {
  'use strict';

  const ASSET_CONFIG = {
    gold: {
      id: 'gold',
      name: 'Ouro',
      icon: '🟡',
      initialPrice: 2,
      // Sobe lentamente: 0 ou +1
      changes: [0, 0, 1, 1, 1]
    },
    house: {
      id: 'house',
      name: 'Casa',
      icon: '🏠',
      initialPrice: 5,
      // Sobe devagar, às vezes um pouco mais rápido, raramente desce
      changes: [-1, 0, 1, 1, 1, 1, 2]
    },
    empresa: {
      id: 'empresa',
      name: 'Empresa',
      icon: '🏢',
      initialPrice: 1,
      // Sobe bem mais rápido mas com volatilidade: pode subir muito ou cair
      changes: [-2, -1, 0, 1, 1, 2, 2, 3, 3, 4]
    },
    carro: {
      id: 'carro',
      name: 'Carro',
      icon: '🚗',
      initialPrice: 10,
      // Bens de consumo: descem quase sempre ou mantêm
      changes: [-1, -1, -1, -1, 0, 0, 0]
    }
  };

  const ASSET_IDS = ['gold', 'house', 'empresa', 'carro'];
  const MIN_PRICE = 1;
  const MAX_PRICE = 20;
  const CHART_MAX_SMALL = 10;
  const CHART_MAX_LARGE = 20;

  function getChartYMax() {
    const anyAbove10 = assets.some(a => (a.history || [a.price]).some(p => p > 10));
    return anyAbove10 ? CHART_MAX_LARGE : CHART_MAX_SMALL;
  }
  const MAX_HISTORY = 20;

  let assets = [];
  let currentRound = 1;
  let lastChange = {};
  let chart = null;
  let roundStartTime = null;
  let timerInterval = null;

  const STORAGE_VERSION = 2; // Bump quando mudar preços iniciais ou config
  const STORAGE_KEYS = {
    assets: 'mini-bolsa-assets',
    round: 'mini-bolsa-round',
    roundStartTime: 'mini-bolsa-round-start',
    version: 'mini-bolsa-version'
  };

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.assets);
      if (data) {
        const parsed = JSON.parse(data);
        const stored = Array.isArray(parsed) ? parsed : (parsed.assets || parsed);
        const round = parseInt(localStorage.getItem(STORAGE_KEYS.round) || '1', 10);
        const roundStartTime = localStorage.getItem(STORAGE_KEYS.roundStartTime);
        return { assets: stored, round, roundStartTime };
      }
    } catch (e) {
      console.warn('Erro a carregar localStorage:', e);
    }
    return null;
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(assets));
      localStorage.setItem(STORAGE_KEYS.round, String(currentRound));
      localStorage.setItem(STORAGE_KEYS.version, String(STORAGE_VERSION));
      if (roundStartTime) localStorage.setItem(STORAGE_KEYS.roundStartTime, String(roundStartTime));
    } catch (e) {
      console.warn('Erro a guardar localStorage:', e);
    }
  }

  /** Evolução baseada no perfil de cada ativo (ouro sobe lentamente, carro desce, etc.) */
  function applyRandomEvolution() {
    lastChange = {};

    assets.forEach(asset => {
      const config = ASSET_CONFIG[asset.id];
      const changes = config?.changes ?? [0];
      const delta = changes[Math.floor(Math.random() * changes.length)];

      const oldPrice = asset.price;
      let newPrice = Math.round(oldPrice + delta);
      newPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, newPrice));

      asset.price = newPrice;
      asset.history = (asset.history || []).slice(-(MAX_HISTORY - 1));
      asset.history.push(newPrice);

      lastChange[asset.id] = newPrice - oldPrice;
    });

    saveToStorage();
    updateUI();
  }

  function nextRound() {
    currentRound += 1;
    roundStartTime = Date.now();
    localStorage.setItem(STORAGE_KEYS.roundStartTime, String(roundStartTime));
    applyRandomEvolution();
    saveToStorage();
    updateUI();
  }

  function updateUI() {
    assets.forEach(asset => {
      const priceEl = document.getElementById(`price-${asset.id}`);
      const changeEl = document.getElementById(`change-${asset.id}`);

      if (priceEl) {
        const span = priceEl.querySelector('span');
        if (span) span.textContent = `Preço: ${asset.price}`;
      }

      if (changeEl) {
        const delta = lastChange[asset.id];
        if (delta !== undefined && delta !== 0) {
          const cls = delta > 0 ? 'price-up' : 'price-down';
          changeEl.innerHTML = `<span class="${cls}">(${delta > 0 ? '+' : ''}${delta})</span>`;
        } else {
          changeEl.innerHTML = '';
        }
      }
    });

    const roundEl = document.getElementById('round-display');
    if (roundEl) roundEl.textContent = `Ronda ${currentRound}`;

    updateChart();
  }

  function initChart() {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('chart-all');
    if (!canvas) return;

    const labels = [];
    const maxLen = Math.max(...assets.map(a => (a.history || []).length), 1);
    for (let i = 0; i < maxLen; i++) labels.push(`P${i + 1}`);

    const colors = {
      gold: '#f59e0b',
      house: '#3b82f6',
      empresa: '#8b5cf6',
      carro: '#f97316'
    };

    chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: assets.map(a => ({
          label: a.name,
          data: a.history || [a.price],
          borderColor: colors[a.id] || '#64748b',
          backgroundColor: colors[a.id] || '#64748b',
          tension: 0.3,
          fill: false,
          pointRadius: 8,
          pointHoverRadius: 12
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            min: MIN_PRICE,
            max: getChartYMax(),
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }

  function updateChart() {
    if (!chart) return;
    const maxLen = Math.max(...assets.map(a => (a.history || []).length), 1);
    chart.options.scales.y.max = getChartYMax();
    chart.data.labels = Array.from({ length: maxLen }, (_, i) => `P${i + 1}`);
    chart.data.datasets = assets.map(a => {
      const colors = { gold: '#f59e0b', house: '#3b82f6', empresa: '#8b5cf6', carro: '#f97316' };
      return {
        label: a.name,
        data: a.history || [a.price],
        borderColor: colors[a.id] || '#64748b',
        backgroundColor: colors[a.id] || '#64748b',
        tension: 0.3,
        fill: false,
        pointRadius: 8,
        pointHoverRadius: 12
      };
    });
    chart.update('none');
  }

  function startTimer() {
    roundStartTime = parseInt(localStorage.getItem(STORAGE_KEYS.roundStartTime) || '0', 10);
    if (!roundStartTime) {
      roundStartTime = Date.now();
      localStorage.setItem(STORAGE_KEYS.roundStartTime, String(roundStartTime));
    }

    function tick() {
      const elapsed = Math.floor((Date.now() - roundStartTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const el = document.getElementById('timer');
      if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function initMarket() {
    const saved = loadFromStorage();
    const savedVersion = parseInt(localStorage.getItem(STORAGE_KEYS.version) || '0', 10);
    const validIds = new Set(ASSET_IDS);
    const valid = saved && saved.assets && saved.assets.length === 4 &&
      saved.assets.every(a => validIds.has(a.id)) &&
      savedVersion === STORAGE_VERSION;

    if (valid) {
      assets = saved.assets;
      currentRound = saved.round || 1;
      roundStartTime = saved.roundStartTime ? parseInt(saved.roundStartTime, 10) : null;
    } else {
      assets = ASSET_IDS.map(id => {
        const config = ASSET_CONFIG[id];
        return {
          id,
          name: config.name,
          icon: config.icon,
          price: config.initialPrice,
          history: [config.initialPrice]
        };
      });
      currentRound = 1;
    }

    lastChange = {};
    updateUI();
    initChart();
    startTimer();

    const nextBtn = document.getElementById('next-round-btn');
    if (nextBtn) nextBtn.onclick = () => nextRound();

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.onclick = () => resetMarket();
  }

  function resetMarket() {
    assets = ASSET_IDS.map(id => {
      const config = ASSET_CONFIG[id];
      return {
        id,
        name: config.name,
        icon: config.icon,
        price: config.initialPrice,
        history: [config.initialPrice]
      };
    });
    currentRound = 1;
    lastChange = {};
    roundStartTime = Date.now();

    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(assets));
    localStorage.setItem(STORAGE_KEYS.round, '1');
    localStorage.setItem(STORAGE_KEYS.version, String(STORAGE_VERSION));
    localStorage.setItem(STORAGE_KEYS.roundStartTime, String(roundStartTime));

    updateUI();
    updateChart();
  }

  document.addEventListener('DOMContentLoaded', initMarket);

  return {
    initMarket,
    nextRound,
    applyRandomEvolution
  };
})();
