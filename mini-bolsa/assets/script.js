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

  /** Explicações iniciais (sem mudança, só contexto) */
  const NOTICIAS_INICIAIS = [
    { id: 'gold', name: 'Ouro', icon: '🟡', text: 'Ouro: escasso, as pessoas escolhem guardá-lo. O mercado valoriza-o conforme a procura.' },
    { id: 'house', name: 'Casa', icon: '🏠', text: 'Casa: construir demora, usa materiais e mão-de-obra. Depende da oferta e da procura.' },
    { id: 'empresa', name: 'Empresa', icon: '🏢', text: 'Empresa: alguém arriscou criar algo. Vale o que o mercado achar que vale.' },
    { id: 'carro', name: 'Carro', icon: '🚗', text: 'Carro: bem de consumo que desgasta. Há muitos à venda, as pessoas decidem se compram.' }
  ];

  /** Notícias realistas, simples para crianças, explicam a evolução */
  const NOTICIAS = {
    gold: {
      up: [
        'Muita gente quer guardar ouro! Há procura, o preço sobe.',
        'Há poucas joalharias com ouro! Menos oferta, mais caro.',
        'A indústria usa ouro nos telemóveis! Procura a subir.',
        'As joalharias fazem colares novos! O ouro está na moda.',
        'O ouro sobe quando as pessoas querem proteger o que têm.',
        'Houve uma tempestade na mina! Menos ouro a sair esta semana.',
        'Os dentistas usam ouro! Há mais procura.',
        'Fechou uma loja de ouro na cidade! Menos oferta.',
        'O banco está a comprar muito ouro! Há menos para vender.',
        'A mina está em obras! Menos produção.',
        'Chegou o Natal e as joias estão na moda! Procura alta.',
        'As pessoas não confiam no papel e compram ouro.',
        'Há menos ouro nas lojas esta época! Preço a subir.',
        'As joalharias encomendaram muito! Falta stock.',
        'Uma mina fechou por segurança! Menos ouro no mercado.',
        'Os ourives estão ocupados! Demora a fazer joias.',
        'O ouro está a ser usado em medicina! Nova procura.',
        'Muita gente casou! Joias de ouro na moda.',
        'O banco subiu o preço para quem quer guardar.',
        'Há atrasos nos transportes do ouro! Menos a chegar às lojas.'
      ],
      down: [
        'Encontraram muito ouro novo numa mina! Há mais nas lojas.',
        'As pessoas estão a vender ouro! Oferta alta, preço a cair.',
        'Há muito ouro à venda! As lojas descontaram.',
        'Abriram uma mina nova! Produção a subir.',
        'As joalharias fecharam para férias! Sobrou ouro.',
        'Menos gente quer ouro esta semana! Procura em baixo.',
        'O banco está a vender ouro! Oferta especial.',
        'A mina aumentou a produção! Há mais ouro.',
        'Inventaram um material que substitui ouro em alguns usos!',
        'As pessoas preferem gastar noutras coisas! Menos procura.',
        'Stock cheio nas joalharias! Baixaram os preços.',
        'Muita gente vendeu joias antigas! Ouro no mercado.',
        'A mina encontrou um novo filão! Mais produção.',
        'As fábricas de telemóveis precisam de menos ouro!',
        'Dia de grandes vendas nas joalharias! Descontos.',
        'O banco devolveu ouro a clientes! Mais oferta.',
        'As importações de ouro aumentaram! Mais disponível.',
        'As pessoas estão confiantes! Menos procura de refúgio.',
        'Oferta e procura: hoje há mais ouro à venda.',
        'As joalharias estão com stock a mais! Liquidam.'
      ],
      stable: [
        'O ouro está calmo hoje. Nada de especial.',
        'Nem subiu nem desceu. Dia tranquilo.',
        'As pessoas esperam para decidir. Mercado parado.',
        'Ninguém comprou nem vendeu muito. Preço igual.',
        'O banco e as lojas em pausa.',
        'Dia de mercado calmo.',
        'Sem notícias das minas. Tudo na mesma.',
        'As joalharias nem compraram nem venderam.',
        'Sem tempestades, sem descobertas. Neutro.',
        'Procura e oferta equilibradas.',
        'Dia sem eventos. O ouro mantém-se.',
        'Os ourives estão em pausa.',
        'Nada mudou nas minas.',
        'Mercado de ouro estável.',
        'Dia normal nas joalharias.'
      ]
    },
    house: {
      up: [
        'Falta gente para construir! Poucos pedreiros, preço a subir.',
        'A madeira e o cimento ficaram mais caros! As casas também.',
        'Muita gente quer casa nova! Procura alta, preço sobe.',
        'Choveu muito e atrasou as obras! Menos casas prontas.',
        'Os tijolos estão caros! As casas novas custam mais.',
        'Nasceu muita gente na região! Precisam de casas.',
        'Uma fábrica de janelas fechou! Menos oferta, casas mais caras.',
        'Os pedreiros foram de férias! As obras pararam.',
        'A madeira está cara! Demorou a crescer na floresta.',
        'A máquina de tijolos avariou! Produção em baixo.',
        'Muita gente mudou para a cidade! Poucas casas, preço alto.',
        'Os pintores estão ocupados! As casas demoram a ficar prontas.',
        'Muita gente quer casa perto da escola! Procura a subir.',
        'O inverno veio cedo! As obras atrasaram.',
        'Há poucos canalizadores! As casas novas demoram.',
        'Uma fábrica de portas fechou! Menos oferta.',
        'Há poucos eletricistas! As casas demoram, preço sobe.',
        'Houve um incêndio na floresta! Falta madeira para construir.',
        'Uma empresa comprou muitas casas! Menos à venda.',
        'O terreno para construir ficou mais caro! Casas sobem.',
        'Os materiais de construção subiram! Cimento e ferro caros.',
        'Choveu durante um mês! As obras pararam.',
        'Muita gente quer casa com jardim! Poucas disponíveis.',
        'Há fila para pedir licenças de construção! Menos casas novas.',
        'A fábrica de vidro está atrasada! Falta janelas.',
        'Os carpinteiros estão ocupados! Madeira demora.',
        'O betão está caro! Materiais a subir.',
        'Nasceram muitos bebés! As famílias precisam de casas maiores.',
        'A empresa de construção tem muitas encomendas! Preços sobem.',
        'O solo é difícil de construir! Obras mais caras.'
      ],
      down: [
        'Sobraram muitas casas à venda! Menos procura, preço a cair.',
        'Construíram muitas casas de uma vez! Oferta grande, barato.',
        'As pessoas mudaram-se para o campo! Sobraram casas na cidade.',
        'A fábrica de tijolos fez muita produção! Materiais baratos.',
        'Os pedreiros voltaram de férias! Muitas casas prontas.',
        'Choveu pouco! As obras acabaram a tempo.',
        'Há tijolos a mais no mercado! Preço a cair.',
        'Muita gente foi viver com a família! Sobraram casas.',
        'Uma empresa vendeu muitas casas! Oferta alta.',
        'Abriram uma nova urbanização! Muitas casas novas.',
        'Os materiais de construção estão baratos! Casas mais acessíveis.',
        'O inverno chegou tarde! Muito tempo para construir.',
        'A fábrica de janelas tem stock! Janelas baratas.',
        'Os pintores acabaram o trabalho! Casas prontas a rodos.',
        'Há muitas casas antigas à venda! Os donos baixaram o preço.',
        'A empresa de construção tem poucas encomendas! Descontos.',
        'Muita gente emigrou! Sobraram casas.',
        'O terreno ficou mais barato! Construir custa menos.',
        'Abriram uma fábrica de portas nova! Mais oferta.',
        'Dia de grandes vendas! Promoções nas casas.',
        'As casas pequenas não vendem! Os donos baixaram.',
        'A madeira está barata! Importaram muita.',
        'Há muitas casas em segunda mão! Concorrência.',
        'Os bancos facilitaram empréstimos! Mais casas à venda.',
        'O cimento está em promoção! Obras mais baratas.',
        'Os construtores querem vender! Liquidam stock.',
        'Menos gente quer casas esta época! Procura em baixo.',
        'Uma urbanização nova tem casas vazias! Descontos.',
        'O mercado imobiliário está calmo! Preços a descer.'
      ],
      stable: [
        'As casas estão calmas. Nem muita procura nem muita oferta.',
        'Hoje as casas ficaram ao mesmo preço.',
        'Os construtores e os compradores estão a esperar.',
        'Dia de mercado parado.',
        'Nem choveu nem fez sol. Obras na mesma.',
        'Os pedreiros estão a almoçar.',
        'Ninguém se mudou. Tudo na mesma.',
        'Sem incêndios, sem tempestades. Neutro.',
        'Oferta e procura equilibradas.',
        'Dia sem eventos no imobiliário.',
        'As fábricas de materiais em ritmo normal.',
        'Ninguém construiu nem vendeu muito.',
        'Mercado de casas estável.',
        'Os compradores estão a ver casas. Sem decisões.',
        'Dia normal na construção.'
      ]
    },
    empresa: {
      up: [
        'A empresa lançou um brinquedo novo! Vendem muito.',
        'Conseguiram vender para muitos países! O negócio cresce.',
        'A empresa fez uma máquina que faz bolos! Sucesso.',
        'Anunciaram um jogo novo! Vendas a subir.',
        'A empresa ganhou um prémio! Investidores felizes.',
        'Descobriram como fazer telemóveis mais baratos! Lucro a subir.',
        'A empresa vai abrir lojas novas! Está a crescer.',
        'Inventaram um robot que limpa a casa! Muita procura.',
        'A empresa fez parceria com uma marca famosa! Negócio em alta.',
        'Lançaram um gelado novo! Sucesso de verão.',
        'A empresa criou um brinquedo que os miúdos adoram!',
        'Conseguiram um contrato grande! Vendas a subir.',
        'A empresa abriu uma nova fábrica! Produção a crescer.',
        'Lançaram uma app nova! Muita gente a descarregar.',
        'A empresa venceu um concurso! Boa publicidade.',
        'Inventaram uma embalagem que conserva melhor! Clientes satisfeitos.',
        'A empresa exporta para a Europa! Mercado maior.',
        'O novo produto é um sucesso! Filas na loja.',
        'A empresa contratou bons engenheiros! Inovações a chegar.',
        'Lançaram uma linha infantil! Os pais compram.',
        'A empresa reduziu custos! Mais lucro.',
        'O produto novo está na moda! Vendas altas.',
        'A empresa fez uma boa campanha! Todos conhecem a marca.',
        'Conseguiram matéria-prima barata! Margens a subir.',
        'A empresa abriu loja online! Vende em todo o lado.',
        'O chefe da empresa deu uma entrevista boa! Confiança a subir.',
        'A empresa recebeu um investimento! Pode crescer mais.',
        'O produto vende bem no estrangeiro! Exportações a subir.',
        'A empresa tem uma equipa forte! Resultados bons.',
        'Lançaram uma versão melhorada! Os clientes preferem.'
      ],
      down: [
        'A máquina da empresa avariou! Produção parada.',
        'A empresa perdeu um cliente importante. Vendas a descer.',
        'Saiu uma notícia má sobre o produto. As pessoas desconfiam.',
        'A concorrência fez um produto melhor. Menos vendas.',
        'O chefe da empresa ficou doente. Decisões atrasadas.',
        'Houve um acidente na fábrica. Produção parada.',
        'O produto novo tem defeitos! Devoluções em massa.',
        'O robot avariou! Recall e custos.',
        'A máquina queimou! Reparar demora.',
        'O jogo novo tem muitos erros! Ninguém quer jogar.',
        'O produto deu alergia a muita gente! Má publicidade.',
        'O produto caiu e partiu-se! Queixas a chegar.',
        'A empresa não conseguiu entregar a tempo! Clientes zangados.',
        'O produto não funciona como prometido! Devoluções.',
        'A concorrência lançou algo mais barato! Perderam clientes.',
        'A matéria-prima ficou cara! Margens a cair.',
        'A empresa fechou uma loja! Menos vendas.',
        'Um fornecedor atrasou! Produção em baixo.',
        'O produto saiu de moda! Stocks parados.',
        'A empresa despediu trabalhadores! Rumores maus.',
        'Perderam um concurso importante! Contrato foi para outro.',
        'O novo produto não vende! Stock a acumular.',
        'A empresa tem dívidas! Investidores preocupados.',
        'Um concorrente copiou o produto! Menos vendas.',
        'A embalagem tem problemas! Produto estraga.',
        'A empresa fechou para obras! Sem vendas esta semana.',
        'O produto foi proibido noutro país! Exportações em baixo.',
        'A fábrica está parada! Problemas técnicos, produção em baixo.',
        'O cliente principal cancelou! Grande prejuízo.',
        'A empresa está a fazer descontos! Margens a cair.',
        'Inventário em excesso! Têm de vender barato.'
      ],
      stable: [
        'A empresa está estável. Nada de especial.',
        'Hoje nem subiu nem desceu. Dia normal.',
        'As vendas estão normais. Sem surpresas.',
        'A empresa está a fazer contas. Decisões para a semana.',
        'O chefe está em reunião. Tudo parado.',
        'A fábrica está em manutenção. Produção normal.',
        'Nem boas nem más notícias. Tudo tranquilo.',
        'Os clientes estão satisfeitos. Nada a reportar.',
        'Os investidores estão a observar. Sem movimentos.',
        'A concorrência também está calma. Mercado neutro.',
        'Dia de relatórios. Sem vendas especiais.',
        'A produção está no ritmo normal.',
        'Nenhum produto novo. Nenhum problema. Neutro.',
        'Oferta e procura equilibradas.',
        'Dia sem eventos. Empresa estável.'
      ]
    },
    carro: {
      up: [
        'A gasolina ficou mais barata! Mais gente quer carro.',
        'Lançaram um carro elétrico bonito! Muita procura.',
        'As lojas deram desconto! As vendas subiram.',
        'O carro do ano ganhou um prémio! Ficou na moda.',
        'O carro novo tem ar condicionado melhor! As famílias gostam.',
        'O carro novo consome menos! Gasolina poupada.',
        'Lançaram um carro com mais espaço! Para viagens longas.',
        'O carro novo tem câmara atrás! Estacionar mais fácil.',
        'O carro que estaciona sozinho vende bem! Tecnologia nova.',
        'O carro solar está na moda! Menos gasolina.',
        'O carro novo tem música melhor! Os miúdos adoram.',
        'As lojas têm poucos carros! Procura alta, preço sobe.',
        'O petróleo ficou mais barato! Gasolina acessível.',
        'O carro novo é mais seguro! Os pais preferem.',
        'Lançaram uma cor nova! Está na moda.',
        'O carro novo tem computador a bordo! Mais conforto.',
        'A marca ganhou um prémio! Boa publicidade.',
        'O carro novo faz menos barulho! Mais silencioso.',
        'As férias chegaram! Muita gente quer carro para a praia.',
        'O carro novo tem porta-malas maior! As famílias compram.',
        'A marca fez uma boa campanha! Todos conhecem.',
        'O carro novo tem travões melhores! Mais segurança.',
        'Os impostos dos carros baixaram! Mais acessível.',
        'O carro novo poupa combustível! Os clientes preferem.',
        'Lançaram um carro pequeno para a cidade! Prático.',
        'O carro familiar está na moda! Espaço para os miúdos.',
        'A marca abriu lojas novas! Mais fácil comprar.',
        'O carro novo tem garantia maior! Confiança.',
        'O petróleo baixou no mercado mundial! Gasolina barata.',
        'O carro novo tem GPS! Ninguém se perde.'
      ],
      down: [
        'A gasolina está muito cara! Menos gente quer comprar carro.',
        'Há muitos carros à venda! As lojas descontam.',
        'Os carros elétricos estão na moda! Os antigos valem menos.',
        'As pessoas preferem autocarro e bicicleta! Menos vendas.',
        'A fábrica fez carros a mais! Sobraram nas lojas.',
        'A gasolina subiu muito! Carro fica caro de manter.',
        'Os carros velhos estragam-se. As pessoas trocam de marca.',
        'Há muito trânsito! Muita gente prefere transportes.',
        'Os materiais ficaram baratos! Os carros também.',
        'Muita gente vendeu o carro! Há muitos à venda.',
        'A escola fica perto! Não precisam de segundo carro.',
        'O modelo antigo saiu de moda! Valor a cair.',
        'A marca concorrente lançou um carro melhor! Perderam vendas.',
        'O carro novo tem defeitos! Queixas a chegar.',
        'O ar condicionado avariou em muitos! Recall.',
        'O modelo descora ao sol! Ninguém quer.',
        'O estacionamento automático falhou! Acidentes.',
        'A música do carro tem problemas! Queixas.',
        'O carro solar não funciona em dias nublados!',
        'O espaço interior é pequeno! As famílias desistiram.',
        'O trânsito piorou! Mais gente anda de bicicleta.',
        'O estacionamento no centro ficou caro! Muita gente vendeu.',
        'O combustível subiu! Manter o carro custa mais.',
        'As crianças gostam de trotinete! Pais vendem o carro.',
        'O carro avariou na primeira semana! Clientes furiosos.',
        'O modelo novo da concorrência é melhor! Vendas em baixo.',
        'As famílias decidiram vender! Preferem gastar noutra coisa.',
        'Muita gente escolheu não ter segundo carro! Oferta e procura.',
        'O petróleo subiu! Gasolina cara.',
        'A marca teve má publicidade! As pessoas desconfiam.',
        'Os impostos dos carros subiram! Menos compras.'
      ],
      stable: [
        'Os carros estão ao mesmo preço. Nem subiu nem desceu.',
        'Hoje ninguém comprou nem vendeu muito. Calma.',
        'O mercado de carros está parado.',
        'A gasolina nem subiu nem desceu. Carros na mesma.',
        'As lojas fazem inventário. Sem promoções.',
        'Os compradores estão a ver carros. Sem decisões.',
        'Nenhum modelo novo. Nenhum problema. Neutro.',
        'O trânsito está normal.',
        'A fábrica em ritmo normal. Produção regular.',
        'Os vendedores em pausa.',
        'Dia sem eventos no mercado automóvel.',
        'Oferta e procura equilibradas.',
        'Sem notícias da gasolina. Tudo na mesma.',
        'Dia normal nas concessionárias.',
        'Nem chuva nem sol. Condições normais para carros.'
      ]
    }
  };
  const MAX_PRICE = 20;
  const CHART_MAX_SMALL = 10;
  const CHART_MAX_LARGE = 20;

  function getChartYMax() {
    const anyAbove10 = assets.some(a => (a.history || [a.price]).some(p => p > 10));
    return anyAbove10 ? CHART_MAX_LARGE : CHART_MAX_SMALL;
  }

  // Margem para as bolas não serem cortadas (Chart.js recorta na área do gráfico)
  const CHART_Y_PADDING = 1.5;
  const MAX_HISTORY = 20;

  let assets = [];
  let currentRound = 1;
  let hasStarted = false; // false = intro, true = chart visível (valores iniciais ou evolução)
  let lastChange = {};
  let currentNews = [];
  let chart = null;
  let roundStartTime = null;
  let timerInterval = null;

  const STORAGE_VERSION = 2; // Bump quando mudar preços iniciais ou config
  const STORAGE_KEYS = {
    assets: 'mini-bolsa-assets',
    round: 'mini-bolsa-round',
    roundStartTime: 'mini-bolsa-round-start',
    version: 'mini-bolsa-version',
    news: 'mini-bolsa-news',
    hasStarted: 'mini-bolsa-has-started'
  };

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.assets);
      if (data) {
        const parsed = JSON.parse(data);
        const stored = Array.isArray(parsed) ? parsed : (parsed.assets || parsed);
        const round = parseInt(localStorage.getItem(STORAGE_KEYS.round) || '1', 10);
        const roundStartTime = localStorage.getItem(STORAGE_KEYS.roundStartTime);
        const news = JSON.parse(localStorage.getItem(STORAGE_KEYS.news) || '[]');
        const hasStarted = localStorage.getItem(STORAGE_KEYS.hasStarted) === 'true';
        return { assets: stored, round, roundStartTime, news, hasStarted };
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
      if (currentNews.length) localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(currentNews));
      localStorage.setItem(STORAGE_KEYS.hasStarted, hasStarted ? 'true' : 'false');
    } catch (e) {
      console.warn('Erro a guardar localStorage:', e);
    }
  }

  function pickNews(assetId, delta) {
    const arr = delta > 0 ? NOTICIAS[assetId].up : delta < 0 ? NOTICIAS[assetId].down : NOTICIAS[assetId].stable;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Evolução baseada no perfil de cada ativo (ouro sobe lentamente, carro desce, etc.) */
  function applyRandomEvolution() {
    lastChange = {};
    currentNews = [];

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

      const actualDelta = newPrice - oldPrice;
      lastChange[asset.id] = actualDelta;
      currentNews.push({ asset: config.name, icon: config.icon, text: pickNews(asset.id, actualDelta) });
    });

    saveToStorage();
    updateUI();
  }

  function onMainButtonClick() {
    if (!hasStarted) {
      // Estado 1 -> 2: "Vamos começar" - mostrar gráfico com valores iniciais
      hasStarted = true;
      saveToStorage();
      updateUI();
      if (chart) chart.resize();
    } else {
      // Estado 2 ou 3+ -> próxima ronda (evolução)
      currentRound += 1;
      roundStartTime = Date.now();
      localStorage.setItem(STORAGE_KEYS.roundStartTime, String(roundStartTime));
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
    if (roundEl) roundEl.textContent = `Ronda ${currentRound}`;

    // Estados: 1=intro, 2=gráfico valores iniciais, 3+=gráfico+notícias
    const introEl = document.getElementById('intro-section');
    const chartSectionEl = document.getElementById('chart-section');
    const newsEl = document.getElementById('news-section');
    const btnEl = document.getElementById('next-round-btn');

    if (introEl) introEl.classList.toggle('hidden', hasStarted);
    if (chartSectionEl) chartSectionEl.classList.toggle('hidden', !hasStarted);

    if (btnEl) btnEl.textContent = hasStarted ? 'Próxima Ronda' : 'Vamos começar';

    if (newsEl) {
      if (currentNews.length > 0) {
        newsEl.innerHTML = `
          <h3 class="text-lg font-bold text-slate-700 mb-3">📰 Notícias desta ronda</h3>
          <ul class="space-y-2 text-slate-600">
            ${currentNews.map(n => `<li class="flex items-start gap-2"><span class="text-2xl">${n.icon}</span><span>${n.text}</span></li>`).join('')}
          </ul>
        `;
        newsEl.classList.remove('hidden');
      } else if (hasStarted) {
        newsEl.innerHTML = `
          <h3 class="text-lg font-bold text-slate-700 mb-3">💡 Cada um em poucas palavras</h3>
          <ul class="space-y-2 text-slate-600">
            ${NOTICIAS_INICIAIS.map(n => `<li class="flex items-start gap-2"><span class="text-2xl">${n.icon}</span><span>${n.text}</span></li>`).join('')}
          </ul>
        `;
        newsEl.classList.remove('hidden');
      } else {
        newsEl.classList.add('hidden');
      }
    }

    updateChart();
    if (hasStarted && chart) chart.resize();
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
          pointHoverRadius: 12,
          clip: 12
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { top: 12, right: 12, bottom: 12, left: 12 }
        },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: {
            min: MIN_PRICE - CHART_Y_PADDING,
            max: getChartYMax() + CHART_Y_PADDING,
            ticks: {
              stepSize: 1,
              callback: (v) => Number.isInteger(v) ? v : ''
            }
          }
        }
      }
    });
  }

  function updateChart() {
    if (!chart) return;
    const maxLen = Math.max(...assets.map(a => (a.history || []).length), 1);
    const yMax = getChartYMax();
    chart.options.scales.y.min = MIN_PRICE - CHART_Y_PADDING;
    chart.options.scales.y.max = yMax + CHART_Y_PADDING;
    chart.options.scales.y.ticks.callback = (v) => Number.isInteger(v) ? v : '';
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
        pointHoverRadius: 12,
        clip: false
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
      currentNews = saved.news || [];
      hasStarted = saved.hasStarted || saved.round > 1;
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
    if (nextBtn) nextBtn.onclick = () => onMainButtonClick();

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
    hasStarted = false;
    lastChange = {};
    currentNews = [];
    roundStartTime = Date.now();

    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(assets));
    localStorage.removeItem(STORAGE_KEYS.news);
    localStorage.setItem(STORAGE_KEYS.hasStarted, 'false');
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
