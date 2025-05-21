/**
 * Controle de Estoque - Script principal
 * Gerencia lançamentos e reservas de estoque
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM principais
  const filters = document.querySelectorAll('.filter');
  const activeIndicator = document.querySelector('.active-indicator');
  const filterNav = document.querySelector('.filter-nav');
  const botaoBreadcrumb = document.getElementById('botaoIncluir');
  const tabela = document.getElementById('tabela-produtos');
  const thead = document.getElementById('tabela-head');

  // ======== FUNÇÕES DO FILTRO E NAVEGAÇÃO ========

  /**
   * Atualiza o indicador visual do filtro ativo
   * @param {HTMLElement} button - O botão do filtro ativo
   */
  function updateIndicator(button) {
    const buttonRect = button.getBoundingClientRect();
    const containerRect = filterNav.getBoundingClientRect();
    const offsetLeft = buttonRect.left - containerRect.left + filterNav.scrollLeft;

    activeIndicator.style.width = `${button.offsetWidth}px`;
    activeIndicator.style.transform = `translateX(${offsetLeft}px)`;
  }

  // ======== FUNÇÕES DE GERENCIAMENTO DE DADOS ========

  /**
   * Busca lançamentos da API
   * @param {number} page - Página atual (paginação)
   * @param {number} size - Tamanho da página
   * @returns {Array} - Lista de lançamentos
   */
  async function fetchLancamentos(page = 0, size = 10) {
    try {
      const response = await fetch(`https://api-fluxo.onrender.com/lote/movimentacoes?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      return [];
    }
  }

  /**
   * Atualiza a tabela de acordo com o tipo de visualização
   * @param {string} tipo - Tipo de conteúdo (lancamentos ou reservas)
   */
  async function atualizarTabela() {
    let dados;

    try {
      botaoBreadcrumb.textContent = 'Incluir lancamento';

      // Configura o cabeçalho da tabela para lançamentos
      thead.innerHTML = `
        <tr>
          <th class="th-opcoes"></th>
          <th>Data e hora</th>
          <th>Entrada</th>
          <th>Saida</th>
          <th>valor</th>
          <th>Observação</th>
          <th>Origem</th>
        </tr>
        `;

      // Busca e renderiza os dados de lançamentos
      dados = await fetchLancamentos();
      tabela.innerHTML = dados
        .map(
          (item) => `
        <tr data-id="${item.id}">
          <td class="menu-opcoes">
            <div class="opcoes-container">
              <button class="botao-opcoes">
                <img src="../ASSETS/ÍCONES/line-dot.png" alt="Opções" class="icone-opcoes">
              </button>
              <div class="menu-acao">
                <ul>
                  <li>Editar</li>
                  <li>Remover lançamento</li>
                  <li>Detalhes</li>
                </ul>
              </div>
            </div>
          </td>
          <td>${new Date(item.movementDate).toLocaleString()}</td>
          <td>${item.movementType === 'ENTRADA' ? item.movementAmount.toFixed(2) : '0,00'}</td>
          <td>${item.movementType === 'SAIDA' ? item.movementAmount.toFixed(2) : '0,00'}</td>
          <td>${item.unitaryPrice.toFixed(2)}</td>
          <td>${item.notes || ''}</td>
          <td>${item.movementType === 'ENTRADA' ? 'Entrada' : 'Saída'}</td>
        </tr>
        `
        )
        .join('');
    } catch (error) {
      console.error('Erro ao atualizar tabela:', error);
      tabela.innerHTML = `<tr><td colspan="7">Nenhum lançamento cadastrado</td></tr>`;
    }
    // Inicializa os menus de opções após atualizar o conteúdo
    inicializarMenuOpcoes();
  }

  // ======== FUNÇÕES PARA AÇÕES NAS LINHAS DA TABELA ========

  /**
   * Inicializa os menus de opções para cada linha da tabela
   */
  function inicializarMenuOpcoes() {
    const botoesOpcoes = document.querySelectorAll('.botao-opcoes');

    // Configura os botões de opções
    botoesOpcoes.forEach((botao) => {
      botao.addEventListener('click', function (e) {
        e.stopPropagation();

        // Fecha outros menus
        document.querySelectorAll('.menu-acao').forEach((menu) => {
          if (menu !== botao.nextElementSibling) {
            menu.style.display = 'none';
          }
        });

        // Abre/fecha o menu atual
        const menu = botao.nextElementSibling;
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      });
    });

    // Adiciona listeners para os itens do menu
    document.querySelectorAll('.menu-acao li').forEach((item) => {
      item.addEventListener('click', function (e) {
        // Encontra a linha (tr) pai
        console.log('clicou em menu-opcao:', this.textContent.trim());
        const tr = this.closest('tr');
        console.log('linha:', tr, 'id=', tr?.dataset.id);
        // Obtém o ID armazenado no data-attribute
        const lancamentoId = tr.dataset.id;
        // Determina qual ação foi clicada
        const acao = this.textContent.trim();

        // Chama a função correspondente passando o ID
        switch (acao) {
          case 'Editar':
            editarLancamento(lancamentoId);
            break;
          case 'Remover lançamento':
            removerLancamento(lancamentoId);
            break;
          case 'Detalhes':
            verDetalhes(lancamentoId);
            break;
        }
      });
    });

    // Fecha menus ao clicar fora
    document.addEventListener('click', () => {
      document.querySelectorAll('.menu-acao').forEach((menu) => {
        menu.style.display = 'none';
      });
    });
  }

  /**
   * Função para editar um lançamento
   * @param {string} id - ID do lançamento
   */
  function editarLancamento(id) {
    console.log('Editando lançamento ID:', id);
    // Lógica de edição será implementada aqui
  }

  /**
   * Função para remover um lançamento
   * @param {string} id - ID do lançamento
   */
  function removerLancamento(id) {
    fetch(`https://api-fluxo.onrender.com/lote/apagar/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    atualizarTabela();
  }
  /**
   * Função para visualizar detalhes de um lançamento
   * @param {string} id - ID do lançamento
   */
  function verDetalhes(id) {
    console.log('Detalhes do lançamento ID:', id);
    // Lógica de detalhamento será implementada aqui
  }

  // ======== INICIALIZAÇÃO E EVENTOS ========

  // Configura eventos de clique nos filtros
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      // Atualiza classe ativa e indicador visual
      filters.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      updateIndicator(button);

      // Atualiza conteúdo com base no filtro selecionado
      if (button.id === 'lancamento-filter') {
        atualizarTabela('lancamentos');
      } else {
        atualizarTabela('reservas');
      }
    });
  });

  // Inicializa com o filtro ativo
  const initialActive = document.querySelector('.filter.active');
  if (initialActive) {
    updateIndicator(initialActive);
    if (initialActive.id === 'lancamento-filter') {
      atualizarTabela('lancamentos');
    } else {
      atualizarTabela('reservas');
    }
  }

  // Atualiza o indicador ao rolar
  filterNav.addEventListener('scroll', () => {
    const activeButton = document.querySelector('.filter.active');
    if (activeButton) {
      updateIndicator(activeButton);
    }
  });

  // ======== ENVIO DO FORMULÁRIO ========

  /**
   * Configuração do envio do formulário para a API
   */
  document.querySelector('.btn-salvar').addEventListener('click', async (e) => {
    e.preventDefault();

    // Coleta dados do formulário
    const tipo = document.getElementById('tipo').value; // 'entrada' ou 'saida'
    const produto = document.getElementById('produto').value;
    const quantidade = parseInt(document.getElementById('quantidade').value) || 0;
    const preco = parseFloat(document.getElementById('preco').value) || 0;
    const lote = document.getElementById('lote').value || '';
    const localizacaoLote = document.getElementById('localicaoLote').value || '';
    const codigoFornecedor = document.getElementById('codigoFornecedor').value || '';
    const fornecedor = document.getElementById('fornecedor').value || '';
    const dataValidade = document.getElementById('data-val').value || '';
    const observacao = document.getElementById('observacao').value || '';
    const movementDate = new Date().toISOString();

    // Configuração de IDs (temporários)
    const productId = produto;
    const supplierId = codigoFornecedor;
    const supplierName = fornecedor;

    // Configuração do payload conforme o tipo de operação
    let payload;
    let url;
    let method;

    if (tipo === 'entrada') {
      url = 'https://api-fluxo.onrender.com/lote/entrada';
      method = 'POST';
      payload = {
        productId: productId,
        supplierInfo: {
          supplierId: supplierId,
          supplierName: supplierName,
        },
        lotInfo: {
          lotCode: lote,
          expiryDate: dataValidade,
          lotLocation: localizacaoLote,
        },
        lotOperation: {
          movementAmount: quantidade,
          unitPrice: preco,
          notes: observacao,
          movementType: tipo,
          movementDate: movementDate,
        },
      };
    } else if (tipo === 'saida') {
      url = 'https://api-fluxo.onrender.com/lote/saida/{lotId}';
      method = 'PATCH';
      payload = {
        productId: productId,
        lotOperation: {
          movementAmount: quantidade,
          unitPrice: preco,
          notes: observacao,
          movementType: tipo,
          movementDate: movementDate,
        },
      };
    } else {
      alert('Tipo inválido');
      return;
    }

    // Envio da requisição para a API
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      // Feedback ao usuário
      if (tipo === 'entrada') {
        alert('Entrada registrada com sucesso!');
      } else if (tipo === 'saida') {
        alert('Saída processada com sucesso!');
      }
    } catch (error) {
      alert('Erro ao enviar dados: ' + error.message);
    }
  });
});

/**
 * Controle da sidebar para inclusão de novos registros
 */
document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const botaoAbrir = document.getElementById('botaoIncluir');
  const incluirSidebar = document.getElementById('incluirSidebar');
  const botaoFechar = document.getElementById('closeIncluirSidebar');

  // Configura eventos para abrir/fechar a sidebar
  botaoAbrir.addEventListener('click', () => {
    incluirSidebar.classList.add('open');
  });

  botaoFechar.addEventListener('click', () => {
    incluirSidebar.classList.remove('open');
  });

  // Inicializa os seletores de data e hora
  flatpickr('#data', {
    dateFormat: 'd/m/Y',
    locale: 'pt',
    static: true,
  });

  flatpickr('#hora', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true,
    locale: 'pt',
    static: true,
  });
});
