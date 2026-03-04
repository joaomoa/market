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
      volatility: 1   // baixa: ±1
    },
    house: {
      id: 'house',
      name: 'Casa',
      icon: '🏠',
      initialPrice: 5,
      volatility: 2   // média: ±2
    },
    empresa: {
      id: 'empresa',
      name: 'Empresa',
      icon: '🏢',
      initialPrice: 1,
      volatility: 3   // alta: ±3
    },
    carro: {
      id: 'carro',
      name: 'Carro',
      icon: '🚗',
      initialPrice: 3,
      volatility: 1   // baixa: ±1
    }
  };

  const ASSET_IDS = ['gold', 'house', 'empresa', 'carro'];
  const MIN_PRICE = 1;
  const MAX_PRICE = 10;
  const MAX_HISTORY = 20;
  const TOTAL_ROUNDS = 5;

  let assets = [];
  let currentRound = 1;
  let lastChange = {};
  let chart = null;
  let timerStart = null;
  let timerInterval = null;

  const STORAGE_KEYS = {
    assets: 'mini-bolsa-assets',
    round: 'mini-bolsa-round',
    timerStart: 'mini-bolsa-timer'
  };

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.assets);
      if (data) {
        const parsed = JSON.parse(data);
        const stored = Array.isArray(parsed) ? parsed : (parsed.assets || parsed);
        const round = parseInt(localStorage.getItem(STORAGE_KEYS.round) || '1', 10);
        const timerStart = localStorage.getItem(STORAGE_KEYS.timerStart);
        return { assets: stored, round, timerStart };
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
      if (timerStart) localStorage.setItem(STORAGE_KEYS.timerStart, String(timerStart));
    } catch (e) {
      console.warn('Erro a guardar localStorage:', e);
    }
  }

  /** Evolução aleatória baseada no perfil de risco (volatilidade) de cada ativo */
  function applyRandomEvolution() {
    lastChange = {};

    assets.forEach(asset => {
      const config = ASSET_CONFIG[asset.id];
      const vol = config?.volatility ?? 1;
      // Gera mudança entre -vol e +vol (ex: vol=1 → -1,0,+1)
      const delta = Math.floor(Math.random() * (2 * vol + 1)) - vol;

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
    if (currentRound < TOTAL_ROUNDS) {
      currentRound += 1;
      applyRandomEvolution();
      saveToStorage();
      updateUI();
    }
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
    if (roundEl) roundEl.textContent = `Ronda ${currentRound}/${TOTAL_ROUNDS}`;

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
          backgroundColor: 'transparent',
          tension: 0.3,
          fill: false
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
            max: MAX_PRICE,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }

  function updateChart() {
    if (!chart) return;
    const maxLen = Math.max(...assets.map(a => (a.history || []).length), 1);
    chart.data.labels = Array.from({ length: maxLen }, (_, i) => `P${i + 1}`);
    chart.data.datasets = assets.map(a => {
      const colors = { gold: '#f59e0b', house: '#3b82f6', empresa: '#8b5cf6', carro: '#f97316' };
      return {
        label: a.name,
        data: a.history || [a.price],
        borderColor: colors[a.id] || '#64748b',
        backgroundColor: 'transparent',
        tension: 0.3,
        fill: false
      };
    });
    chart.update('none');
  }

  function startTimer() {
    timerStart = parseInt(localStorage.getItem(STORAGE_KEYS.timerStart) || '0', 10);
    if (!timerStart) {
      timerStart = Date.now();
      localStorage.setItem(STORAGE_KEYS.timerStart, String(timerStart));
    }

    function tick() {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
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
    const validIds = new Set(ASSET_IDS);
    const valid = saved && saved.assets && saved.assets.length === 4 &&
      saved.assets.every(a => validIds.has(a.id));

    if (valid) {
      assets = saved.assets;
      currentRound = saved.round || 1;
      timerStart = saved.timerStart ? parseInt(saved.timerStart, 10) : null;
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
  }

  document.addEventListener('DOMContentLoaded', initMarket);

  return {
    initMarket,
    nextRound,
    applyRandomEvolution
  };
})();
