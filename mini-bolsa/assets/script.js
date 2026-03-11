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

  /** Notícias inventadas, simples para crianças de 6 anos, explicam a evolução */
  const NOTICIAS = {
    gold: {
      up: [
        'O banco guardou muito ouro! As pessoas querem ouro quando têm medo.',
        'Há poucas lojas com ouro! Por isso ficou mais caro.',
        'Descobriram que o ouro é bom para os telemóveis! Todos querem.',
        'As avós estão a dar ouro aos netos! Há menos nas lojas.',
        'O ouro subiu porque muita gente o quer guardar em casa.',
        'As pessoas têm medo e compram ouro. Ficou mais caro!',
        'O rei precisa de ouro para a coroa! Há menos para vender.',
        'As joalharias fazem colares novos! O ouro está na moda.',
        'Houve uma tempestade na mina de ouro! Menos ouro a sair.',
        'Os dentistas usam ouro nos dentes! Há mais gente a precisar.',
        'A Lua está cheia e dizem que o ouro vale mais! As pessoas acreditam.',
        'Fechou a maior loja de ouro da cidade! Só restam as pequenas.',
        'O papá Noel precisa de ouro para os presentes! Subiu o preço.',
        'Inventaram um jogo onde se ganha ouro! Toda a gente quer.',
        'As formigas encontraram ouro no jardim! Brincadeira, mas as pessoas acreditam.',
        'O dragão guarda o ouro na caverna! Ninguém o vai buscar.',
        'O banco aumentou o preço do ouro para guardar.',
        'As rainhas de todo o mundo querem mais joias! O ouro subiu.',
        'A mina da montanha está em obras! Menos ouro esta semana.',
        'Os piratas esconderam o ouro! Há menos nos barcos.',
        'O sol brilhou muito no ouro! As pessoas acham que ficou mais valioso.',
        'A vovó disse que o ouro protege da bruxa! Todos querem um pouco.',
        'O cofre do banco está cheio! Não querem vender mais.',
        'Inventaram uma máquina que transforma areia em ouro! Mas é mentira.',
        'O gato do vizinho encontrou uma moeda de ouro! História que fez subir.',
        'As estrelas caíram e dizem que são de ouro! As pessoas acreditam.',
        'O feiticeiro precisa de ouro para a poção! Há fila na loja.',
        'O unicórnio deixou pó de ouro no jardim! Corrida às lojas.',
        'A professora disse que o ouro vale muito! As crianças contaram aos pais.',
        'O super-herói usa um cinto de ouro! Toda a gente quer um.'
      ],
      down: [
        'Encontraram muito ouro novo numa montanha! Há mais nas lojas.',
        'As pessoas estão felizes e não precisam tanto de ouro.',
        'Há muito ouro à venda! Por isso baixou o preço.',
        'As lojas têm stock cheio de ouro. Descontaram o preço.',
        'Abriram uma mina gigante! O ouro está a sair às toneladas.',
        'Ninguém quer ouro esta semana! As lojas baixaram.',
        'O dragão largou o ouro da caverna! Há muito no chão.',
        'Os piratas devolveram o ouro! Está tudo à venda.',
        'Inventaram ouro falso muito bom! O verdadeiro desvalorizou.',
        'As joalharias fecharam para férias! Sobrou ouro.',
        'O banco está a vender ouro barato! Oferta especial.',
        'A mina encontrou ouro a mais! Não sabem onde guardar.',
        'As pessoas preferem guardar dinheiro no mealheiro! Menos procura de ouro.',
        'O cofre do banco rebentou! O ouro espalhou-se e há muito.',
        'Descobriram que a areia da praia tem ouro! Brincadeira, mas venderam na mesma.',
        'O gato encontrou mais moedas! Agora há muitas.',
        'O feiticeiro desistiu da poção! Devolveu o ouro às lojas.',
        'O super-herói deixou de usar o cinto! O ouro voltou ao mercado.',
        'As rainhas já têm joias suficientes! Pararam de comprar.',
        'A vovó disse que a bruxa fugiu! Ninguém precisa de ouro para proteção.'
      ],
      stable: [
        'O ouro está calmo hoje. Nada de especial aconteceu.',
        'O ouro nem subiu nem desceu. Tudo tranquilo!',
        'Hoje o ouro ficou igual. As pessoas esperam para decidir.',
        'Ninguém comprou nem vendeu ouro. Dia aborrecido.',
        'O banco e as lojas estão em pausa. Preço igual.',
        'As pessoas estão a pensar. O ouro espera.',
        'Dia de mercado calmo. O ouro não se mexeu.',
        'Nem o dragão nem os piratas fizeram nada. Tudo na mesma.',
        'A professora não deu testes. O ouro relaxou.',
        'O gato dormiu o dia todo. O ouro também.',
        'Nem sol nem tempestade. O ouro está neutro.',
        'As avós estão a tricotar. O ouro pode esperar.',
        'Dia sem notícias. O ouro ficou parado.',
        'O feiticeiro está de folga. O ouro descansa.',
        'Nada de especial no reino. O ouro mantém-se.'
      ]
    },
    house: {
      up: [
        'Falta gente para construir casas! Poucos pedreiros, preço a subir.',
        'A madeira e o cimento ficaram mais caros! As casas também.',
        'Muita gente quer casa nova! Há filas, o preço subiu.',
        'Choveu muito e atrasou as obras. Menos casas prontas = mais caro.',
        'Os tijolos estão caros! As casas novas custam mais.',
        'Nasceu muita gente! Precisam de casas, o preço subiu.',
        'Fecharam uma fábrica de janelas. Menos casas a ficar prontas.',
        'Os pedreiros foram de férias! As obras pararam.',
        'O pinheiro que faz a madeira demorou a crescer! Falta madeira.',
        'A máquina de fazer tijolos avariou! Produção em baixo.',
        'Muita gente mudou para a cidade! Poucas casas, preço alto.',
        'Os pintores estão ocupados noutras obras! As casas demoram.',
        'A escola abriu e as famílias precisam de casa perto! Subiu o preço.',
        'O inverno veio cedo! As obras atrasaram.',
        'Os canalizadores são poucos! As casas novas demoram.',
        'A fábrica de portas fechou! Não há portas para as casas.',
        'Os eletricistas estão em greve! As casas sem luz não se vendem bem, mas há poucas.',
        'O cão do construtor enterrou as ferramentas! Obras atrasadas.',
        'Nasceu um bebé na família real! Precisam de mais quartos.',
        'O super-herói quer uma base secreta! Comprou muitas casas.',
        'A princesa quer um castelo maior! As casas normais ficaram caras.',
        'Os duendes construíram casas pequenas! Só servem para eles.',
        'A formiga rainha precisa de palácio! Competição por casas.',
        'O dragão queimou casas! Há menos, o preço subiu.',
        'A tempestade derrubou árvores! Menos madeira para construir.',
        'Os pássaros fizeram ninhos nos andaimes! As obras pararam.',
        'O coelho da Páscoa precisa de toca maior! Quer comprar casa.',
        'O pai Natal construiu mais uma fábrica! Menos materiais para nós.',
        'A bruxa quer casa com forno grande! Procura casas especiais.',
        'O unicórnio precisa de estábulo! Entrou no mercado.'
      ],
      down: [
        'Sobraram muitas casas à venda! Ninguém comprou, baixaram o preço.',
        'Construíram muitas casas de uma vez! Há muitas, ficou barato.',
        'As pessoas estão a mudar-se para o campo. Sobraram casas na cidade.',
        'A fábrica de tijolos fez muita produção. Materiais mais baratos.',
        'Os pedreiros voltaram de férias! Muitas casas prontas.',
        'Choveu pouco! As obras acabaram a tempo.',
        'A máquina de tijolos funcionou dia e noite! Há tijolos a mais.',
        'Muita gente foi para a avó! Sobraram casas.',
        'O super-herói desistiu da base! Vendeu as casas barato.',
        'A princesa gostou do castelo antigo! Não quer casa nova.',
        'O dragão foi embora! As casas queimadas foram reconstruídas.',
        'Os duendes construíram casas para todos! Oferta enorme.',
        'A formiga rainha mudou para o formigueiro! Devolveu o palácio.',
        'Os pássaros saíram dos andaimes! As obras aceleraram.',
        'O coelho da Páscoa desistiu! Há casas à venda.',
        'A bruxa preferiu viver na floresta! Vendeu a casa.',
        'O unicórnio voltou para o arco-íris! O estábulo está à venda.',
        'Abriram uma nova fábrica de janelas! Janelas baratas.',
        'Os pintores acabaram o trabalho! Casas prontas a rodos.',
        'O inverno chegou tarde! Muito tempo para construir.'
      ],
      stable: [
        'As casas estão calmas. Nem muita gente a comprar nem a vender.',
        'Hoje as casas ficaram ao mesmo preço. Nada mudou.',
        'Os construtores e os compradores estão a esperar.',
        'Dia de mercado imobiliário parado. Preços iguais.',
        'Nem choveu nem fez sol. Obras nem avançaram nem atrasaram.',
        'Os pedreiros estão a almoçar. As casas esperam.',
        'Ninguém nasceu nem se mudou. Tudo na mesma.',
        'O dragão está a dormir. As casas em paz.',
        'A princesa está a pensar. Não compra nem vende.',
        'Os duendes estão a jogar. Construções em pausa.',
        'O coelho da Páscoa está a contar ovos. Casas esquecidas.',
        'Dia sem tempestades. Nada mudou no mercado.',
        'A formiga rainha mudou de ideias. Espera para decidir.',
        'O super-herói está a salvar o mundo. Sem tempo para casas.',
        'A bruxa está a fazer poções. O mercado imobiliário espera.'
      ]
    },
    empresa: {
      up: [
        'A empresa inventou um brinquedo novo! Toda a gente quer, subiu muito.',
        'Conseguiram vender para muitos países! O negócio está a crescer.',
        'A empresa fez uma máquina que faz bolos sozinha! Sucesso total.',
        'Anunciaram um jogo novo! As ações dispararam.',
        'A empresa ganhou um prémio! Toda a gente quer investir.',
        'Descobriram como fazer telemóveis mais baratos! Lucro a subir.',
        'A empresa vai abrir 10 lojas novas! Está a crescer depressa.',
        'Inventaram um robot que limpa a casa! Vendem muito.',
        'A empresa fez parceria com uma marca famosa! Negócio em alta.',
        'A empresa faz agora gelados que não derretem! Sucesso de verão.',
        'Inventaram uma mochila que voa! Toda a gente quer uma.',
        'A empresa criou um lápis que apaga erros sozinho! Os miúdos adoram.',
        'Fizeram uma televisão que dá abraços! As vendas explodiram.',
        'A empresa descobriu como fazer chuva de rebuçados! Impossível mas venderam a ideia.',
        'Lançaram uma pasta de dentes com sabor a chocolate! Sucesso nas escolas.',
        'Inventaram uma cama que faz as crianças adormecer em 1 minuto! Os pais enlouqueceram a comprar.',
        'A empresa fez um carro de brincar que anda de verdade! Filas na loja.',
        'Criaram uma máquina de fazer pipocas em forma de estrela! Moda total.',
        'A empresa ganhou o concurso da melhor sandes do mundo! Investidores felizes.',
        'Inventaram um chapéu que fala! As crianças querem todos.',
        'Fizeram um relógio que para o tempo! Brincadeira, mas as ações subiram.',
        'A empresa criou uma pasta que faz os trabalhos de casa! Os pais desconfiam mas compram.',
        'Lançaram um drone que leva o pequeno-almoço à cama! Luxo que vende.',
        'Inventaram uma ventoinha que cheira a flores! Sucesso no verão.',
        'A empresa faz agora bonecos que cantam as canções de embalar! Bebés a dormir = pais felizes.',
        'Criaram um skate que anda sobre a água! Os miúdos enlouqueceram.',
        'A empresa descobriu a fórmula do sumo que faz crescer! Os pais compram às toneladas.',
        'Fizeram uma bola que nunca perde! Impossível, mas as ações subiram.',
        'Inventaram um guarda-chuva que seca a chuva! As pessoas acreditaram.',
        'A empresa lançou o jogo do ano! Toda a gente está a jogar.',
        'Conseguiram que as galinhas pusessem ovos quadrados! Os ovos estão na moda.',
        'A empresa fez um comboio que voa! Bilhetes esgotados.',
        'Inventaram uma escova que penteia sozinha! Cabelo arrumado = sucesso.',
        'A empresa criou um caderno que nunca acaba! Os estudantes adoram.',
        'Fizeram uma lanterna que afugenta monstros! Debaixo da cama vazio.',
        'A empresa ganhou o prémio de melhor invenção do século! Investidores em fila.',
        'Inventaram um saco de mochila que engole os livros pesados! Costas felizes.',
        'Lançaram um despertador que faz cócegas! Ninguém dorme tarde.'
      ],
      down: [
        'A máquina da empresa avariou! Pararam a produção, o preço caiu.',
        'A empresa perdeu um cliente importante. Vendas a descer.',
        'Saiu uma notícia má sobre a empresa. As pessoas desconfiam.',
        'A concorrência fez um produto melhor. Menos vendas.',
        'O chefe da empresa ficou doente. Tudo parou um bocadinho.',
        'Houve um acidente na fábrica. A produção atrasou.',
        'A empresa inventou um brinquedo que se partiu todo! Devoluções em massa.',
        'O robot que limpa a casa começou a fazer bagunça! Recall total.',
        'A máquina de bolos queimou a cozinha! Processos em tribunal.',
        'O jogo novo tem tantos bugs que ninguém quer jogar!',
        'A pasta de dentes com chocolate deu cáries! Má publicidade.',
        'O drone do pequeno-almoço caiu na cabeça de um cliente! Notícias más.',
        'A ventoinha com cheiro de flores deu alergia a muita gente!',
        'O skate sobre água afunda! Os miúdos ficaram desiludidos.',
        'O sumo que faz crescer não funciona! Os pais exigem o dinheiro de volta.',
        'A bola que nunca perde perdeu! A empresa perdeu a credibilidade.',
        'O guarda-chuva que seca a chuva molhou tudo! Fraude descoberta.',
        'As galinhas dos ovos quadrados fugiram! Sem produção.',
        'O comboio voador aterrou mal! Acidente sem gravidade.',
        'A escova que penteia sozinha puxou o cabelo! Queixas a chegar.',
        'O caderno infinito acabou na página 10! Os estudantes zangados.',
        'A lanterna anti-monstros não funciona! Os monstros voltaram.',
        'O despertador com cócegas assustou as crianças! Pais furiosos.',
        'O lápis mágico apagou os testes! Os professores proibiram.',
        'A mochila voadora caiu com as crianças! Polémica nacional.',
        'A televisão dos abraços deu um choque! Recalls.',
        'A cama mágica não funciona! Crianças ainda acordam a meio da noite.',
        'O chapéu que fala diz palavrões! Retirado do mercado.',
        'A empresa fechou para férias inesperadas! Clientes à espera.',
        'O dragão queimou a fábrica! Produção parada.',
        'Os duendes da empresa fizeram greve! Nada sai da linha de produção.'
      ],
      stable: [
        'A empresa está estável. Nada de muito bom nem muito mau.',
        'Hoje a empresa nem subiu nem desceu. Dia normal.',
        'As vendas estão normais. Sem surpresas.',
        'A empresa está a fazer contas. Decisões para a semana.',
        'O chefe está em reunião. Tudo parado.',
        'A fábrica está em manutenção. Produção normal.',
        'Nem invenções novas nem problemas. Tudo tranquilo.',
        'Os clientes estão satisfeitos. Nada a reportar.',
        'O robot está a carregar. Pausa técnica.',
        'A máquina de bolos está a arrefecer. Intervalo.',
        'Os investidores estão a observar. Sem movimentos.',
        'A concorrência também está calma. Mercado neutro.',
        'O dragão não veio visitar. Fábrica em paz.',
        'Os duendes estão a almoçar. Produção normal.',
        'Dia de relatórios. Nada de vendas especiais.'
      ]
    },
    carro: {
      up: [
        'A gasolina ficou mais barata! Mais gente quer carro.',
        'Fizeram um carro elétrico bonito! Todos querem um.',
        'Deram desconto nos carros novos! As vendas subiram um bocadinho.',
        'O carro do ano ganhou um prémio! Ficou na moda.',
        'Inventaram um carro que fala com os miúdos! As famílias adoram.',
        'O carro novo tem cinema lá dentro! Viagens longas ficaram fixes.',
        'Fizeram um carro cor de arco-íris! Os filhos obrigaram os pais a comprar.',
        'O carro novo cheira a gelado! Fresquinho no verão.',
        'Lançaram um carro com slide no tejadilho! Para a praia.',
        'O carro tem um robô que conta histórias! Bebés a dormir no banco de trás.',
        'Fizeram um carro que estaciona sozinho! Os pais compram na hora.',
        'O carro novo toca a música preferida de cada um! Mágica.',
        'Inventaram um carro que não precisa de gasolina! Carregamento solar.',
        'O carro tem parque infantil lá dentro! Para viagens muito longas.',
        'Lançaram o carro do super-herói favorito! Crianças a gritar.',
        'O carro novo tem piscina! Mentira, mas as ações subiram.',
        'Fizeram um carro que flutua no trânsito! Sonho de todos.',
        'O carro dá um abraço quando chegas! Tecnologia emocional.',
        'Inventaram um carro que faz pipocas! Cinema em movimento.',
        'O carro do desenho animado existe! Toda a gente quer.'
      ],
      down: [
        'A gasolina está muito cara! Menos gente quer comprar carro.',
        'Há muitos carros à venda! As lojas descontam para vender.',
        'Inventaram carros que andam sozinhos! Os antigos valem menos.',
        'As pessoas preferem autocarro e bicicleta! Menos carros vendidos.',
        'A fábrica fez carros a mais! Sobraram nas lojas, preço a cair.',
        'A gasolina subiu muito! Ninguém quer gastar dinheiro em carro.',
        'Os carros velhos estão a estragar-se. As pessoas desistem de comprar.',
        'Há filas enormes de trânsito! As pessoas preferem andar a pé.',
        'Os materiais para fazer carros ficaram baratos! Os carros também.',
        'Muita gente vendeu o carro. Há muitos à venda, preço desceu.',
        'A escola fica perto! Os pais já não precisam de segundo carro.',
        'O autocolante do carro favorito saiu de moda! Carros antigos sem valor.',
        'Inventaram teletransporte! Ninguém quer carro. (É mentira mas venderam a ideia.)',
        'O carro que fala está com a voz avariada! Queixas e desvalorização.',
        'O cinema do carro dá enjoos! As famílias desistiram.',
        'O carro arco-íris descorou ao sol! Ninguém quer.',
        'O slide do tejadilho é perigoso! Retirado do mercado.',
        'O robô das histórias conta histórias de terror! Bebés a chorar.',
        'O carro que estaciona sozinho estacionou em cima de outro! Acidentes.',
        'A música do carro toca sempre a mesma! Os filhos revoltaram-se.',
        'O carro solar não funciona à noite! Óbvio mas ninguém pensou.',
        'O parque infantil do carro não cabe! Fraude.',
        'O carro do super-herói é lento! Desilusão total.',
        'O carro que flutua não flutua! Processos em tribunal.',
        'O carro dos abraços dá choques! Recall.',
        'O carro das pipocas entupiu! Cinema cancelado.',
        'O trânsito piorou! Mais gente a andar de bicicleta.',
        'A cidade proibiu carros no centro! Menos vendas.',
        'O preço do estacionamento subiu muito! Carro = despesa.',
        'As crianças preferem trotinete! Pais vendem o carro.',
        'O carro do desenho animado avariou na primeira semana! Clientes furiosos.',
        'Inventaram patins voadores! Moda nova, carros velhos.',
        'A avó disse que o carro polui! As famílias conscientes vendem.',
        'O cão do vizinho tem medo de carros! História que espalhou.',
        'A professora fez um projeto sobre poluição! Menos carros nas famílias.'
      ],
      stable: [
        'Os carros estão ao mesmo preço. Nem subiu nem desceu.',
        'Hoje ninguém comprou nem vendeu muitos carros. Calma.',
        'O mercado de carros está parado. Tudo igual.',
        'A gasolina nem subiu nem desceu. Carros na mesma.',
        'As lojas estão a fazer inventário. Sem vendas especiais.',
        'Os pais estão a pensar em comprar. Ainda não decidiram.',
        'Nenhum carro novo saiu. Nenhum avariou. Tudo neutro.',
        'O trânsito está normal. Nem melhor nem pior.',
        'A fábrica está em pausa. Produção regular.',
        'Os vendedores estão a almoçar. Sem pressa.',
        'O super-herói está a andar a pé. Carros em repouso.',
        'O robô do carro está a atualizar. Sem novidades.',
        'A professora não falou de carros hoje. Mercado silencioso.',
        'O dragão não queimou estradas. Carros seguros.',
        'Nem chuva nem sol forte. Condições normais para carros.'
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
    news: 'mini-bolsa-news'
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
        return { assets: stored, round, roundStartTime, news };
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

    const newsEl = document.getElementById('news-section');
    if (newsEl) {
      if (currentNews.length > 0) {
        newsEl.innerHTML = `
          <h3 class="text-lg font-bold text-slate-700 mb-3">📰 Notícias desta ronda</h3>
          <ul class="space-y-2 text-slate-600">
            ${currentNews.map(n => `<li class="flex items-start gap-2"><span class="text-2xl">${n.icon}</span><span>${n.text}</span></li>`).join('')}
          </ul>
        `;
        newsEl.classList.remove('hidden');
      } else {
        newsEl.innerHTML = '<p class="text-slate-500 italic">Clica em "Próxima Ronda" para ver as notícias!</p>';
        newsEl.classList.remove('hidden');
      }
    }

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
    currentNews = [];
    roundStartTime = Date.now();

    localStorage.setItem(STORAGE_KEYS.assets, JSON.stringify(assets));
    localStorage.removeItem(STORAGE_KEYS.news);
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
