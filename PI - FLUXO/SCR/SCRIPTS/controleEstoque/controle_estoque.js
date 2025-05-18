document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.filter');
  const activeIndicator = document.querySelector('.active-indicator');
  const filterNav = document.querySelector('.filter-nav');
  const botaoBreadcrumb = document.getElementById('botaoIncluir');
  const tabela = document.getElementById('tabela-produtos');
  const thead = document.getElementById('tabela-head');

  // Função para atualizar visual do indicador do filtro
  function updateIndicator(button) {
    const buttonRect = button.getBoundingClientRect();
    const containerRect = filterNav.getBoundingClientRect();
    const offsetLeft = buttonRect.left - containerRect.left + filterNav.scrollLeft;

    activeIndicator.style.width = `${button.offsetWidth}px`;
    activeIndicator.style.transform = `translateX(${offsetLeft}px)`;
  }

  // Troca conteúdo com base no filtro
  function atualizarTabela(tipo) {
    if (tipo === 'lancamentos') {
      botaoBreadcrumb.textContent = 'Incluir lancamento';
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
      tabela.innerHTML = `
        ${[...Array(5)].map(() => `
          <tr>
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
            <td>05/03/2025 - 11:00</td>
            <td>00,00</td>
            <td>10,00</td>
            <td>16,43</td>
            <td>"comentario"</td>
            <td>Venda</td>
          </tr>`).join('')
        }
      `;
    } else {
      botaoBreadcrumb.textContent = 'Incluir reserva';
      thead.innerHTML = `
        <tr>
          <th class="th-opcoes"></th>
          <th>Data e hora</th>
          <th>Quantidade</th>
          <th>Observação</th>
        </tr>
      `;
      tabela.innerHTML = `
        ${[...Array(5)].map(() => `
          <tr>
            <td class="menu-opcoes">
              <div class="opcoes-container">
                <button class="botao-opcoes">
                  <img src="../ASSETS/ÍCONES/line-dot.png" alt="Opções" class="icone-opcoes">
                </button>
                <div class="menu-acao">
                  <ul>
                    <li>Editar</li>
                    <li>Remover reserva</li>
                    <li>Detalhes</li>
                  </ul>
                </div>
              </div>
            </td>
            <td>10/04/2025 - 15:00</td>
            <td>5</td>
            <td>"reserva x"</td>
          </tr>`).join('')
        }
      `;
    }

    inicializarMenuOpcoes(); // reativa o menu de opções
  }

  // Eventos de filtro
  filters.forEach(button => {
    button.addEventListener('click', () => {
      filters.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      updateIndicator(button);

      if (button.id === 'lancamento-filter') {
        atualizarTabela('lancamentos');
      } else {
        atualizarTabela('reservas');
      }
    });
  });

  const initialActive = document.querySelector('.filter.active');
  if (initialActive) {
    updateIndicator(initialActive);
    if (initialActive.id === 'lancamento-filter') {
      atualizarTabela('lancamentos');
    } else {
      atualizarTabela('reservas');
    }
  }

  filterNav.addEventListener('scroll', () => {
    const activeButton = document.querySelector('.filter.active');
    if (activeButton) {
      updateIndicator(activeButton);
    }
  });

  // Função reutilizável para ativar menu de opções
  function inicializarMenuOpcoes() {
    const botoesOpcoes = document.querySelectorAll(".botao-opcoes");

    botoesOpcoes.forEach(botao => {
      botao.addEventListener("click", function (e) {
        e.stopPropagation();

        document.querySelectorAll(".menu-acao").forEach(menu => {
          if (menu !== botao.nextElementSibling) {
            menu.style.display = "none";
          }
        });

        const menu = botao.nextElementSibling;
        menu.style.display = (menu.style.display === "block") ? "none" : "block";
      });
    });

    document.addEventListener("click", function () {
      document.querySelectorAll(".menu-acao").forEach(menu => {
        menu.style.display = "none";
      });
    });
  }

  //envio do formulario pra api

document.querySelector('.btn-salvar').addEventListener('click', async (e) => {
  e.preventDefault();

  // Pega dados do formulário
  const tipo = document.getElementById('tipo').value; // 'entrada' ou 'saida'
  const produto = document.getElementById('produto').value; // ex: 'produto1'
  const quantidade = parseInt(document.getElementById('quantidade').value) || 0;
  const preco = parseFloat(document.getElementById('preco').value) || 0;
  const lote = document.getElementById('lote').value || '';
  const localizacaoLote = document.getElementById('localicaoLote').value || '';
  const codigoFornecedor = document.getElementById('codigoFornecedor').value || '';
  const fornecedor = document.getElementById('fornecedor').value || '';
  const dataValidade = document.getElementById('data-val').value || ''; // "YYYY-MM-DD"
  const observacao = document.getElementById('observacao').value || '';
  const movementDate = new Date().toISOString();


  // converter "produto" para productId numérico da API
  // e código fornecedor para supplierId
  // Por enquanto fixo para testar:
  const productId = produto; 
  const supplierId = codigoFornecedor;
  const supplierName = fornecedor;

  //payload conforme o tipo
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
        supplierName: supplierName
      },
      lotInfo: {
        lotCode: lote,
        expiryDate: dataValidade,
        lotLocation: localizacaoLote
      },
      lotOperation: {
        movementAmount: quantidade,
        unitPrice: preco,
        notes: observacao,
        movementType: tipo,
        movementDate: movementDate //data que foi feito a iniclusao
      }
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
        movementDate: movementDate //data que foi feito a inclusao
      }
    };
  } else {
    alert('Tipo inválido');
    return;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

   if (!response.ok) {
  throw new Error(`Erro na requisição: ${response.status}`);
}

   if (tipo === 'entrada') {
    alert('Entrada registrada com sucesso!');
}  else if (tipo === 'saida') {
    alert('Saída processada com sucesso!');
}

  
  } catch (error) {
    alert('Erro ao enviar dados: ' + error.message);
  }
});




});

document.addEventListener('DOMContentLoaded', () => {
  const botaoAbrir = document.getElementById("botaoIncluir");
  const incluirSidebar = document.getElementById("incluirSidebar");
  const botaoFechar = document.getElementById("closeIncluirSidebar");

  botaoAbrir.addEventListener("click", () => {
    incluirSidebar.classList.add("open");
  });

  botaoFechar.addEventListener("click", () => {
    incluirSidebar.classList.remove("open");
  });



  flatpickr("#data", {
    dateFormat: "d/m/Y",
    locale: "pt",
    static: true
  });
  
  flatpickr("#hora", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
  locale: "pt",
  static: true
});
  
});
