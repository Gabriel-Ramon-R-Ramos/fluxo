document.addEventListener('DOMContentLoaded', () => {
  const tabelaBody = document.getElementById('tabela-produtos');
  const selectAllCheckbox = document.getElementById('selectAll');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const paginacaoContainer = document.getElementById('paginacao');
  const filters = document.querySelectorAll('.filter');
  const activeIndicator = document.querySelector('.active-indicator');
  const filterNav = document.querySelector('.filter-nav');

  let produtos = [];
  let paginaAtual = 1;
  let totalPaginas = 1;
  const itensPorPagina = 10;

  // Verifica autenticação
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Função principal para buscar produtos
  function fetchProdutos(page = 1, search = '') {
    const url = new URL('https://api-fluxo.onrender.com/produtos/todos');
    url.searchParams.append('page', page - 1);
    url.searchParams.append('size', itensPorPagina);
    if (search) url.searchParams.append('search', search);

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
          }
          throw new Error('Erro na requisição');
        }
        return res.json();
      })
      .then((data) => {
        produtos = data.productsInPage.map((item) => ({
          productInfo: {
            productName: item.productName,
            productSKU: item.productSKU,
          },
          priceInfo: {
            productPrice: item.productPrice.toFixed(2),
          },
          stockInfo: {
            quantityInStock: item.availableQuantity,
            minimumStock: 0,
          },
          validityInfo: {
            productValidity: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('pt-BR') : 'N/A',
          },
          id: item.id,
        }));

        totalPaginas = data.totalPages;
        renderizarProdutos(produtos);
        renderizarPaginacao();
      })
      .catch((error) => {
        console.error('Erro ao buscar produtos:', error);
        alert('Erro ao carregar produtos');
      });
  }

  function renderizarProdutos(produtosPagina) {
    tabelaBody.innerHTML = '';

    produtosPagina.forEach((produto) => {
      const row = document.createElement('tr');
      row.dataset.id = produto.id;
      row.innerHTML = `
        <td><input type="checkbox" class="produto-checkbox"></td>
        <td>${produto.productInfo.productName}</td>
        <td>${produto.productInfo.productSKU}</td>
        <td>R$ ${produto.priceInfo.productPrice}</td>
        <td class="${produto.stockInfo.quantityInStock <= 0 ? 'sem-estoque' : ''}">
          ${produto.stockInfo.quantityInStock}
        </td>

        <td>${produto.validityInfo.productValidity}</td>
      `;

      // Evento de clique para detalhes do produto
      row.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('td:first-child')) return;
        window.location.href = `Cadastro_Produtos.html?id=${produto.id}`;
      });

      tabelaBody.appendChild(row);
    });

    // Sincroniza checkboxes
    const checkboxes = tabelaBody.querySelectorAll('.produto-checkbox');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  }

  function renderizarPaginacao() {
    paginacaoContainer.innerHTML = '';
    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.innerText = i.toString().padStart(2, '0');
      btn.classList.add('pagina-btn');
      if (i === paginaAtual) btn.classList.add('ativa');

      btn.addEventListener('click', () => {
        paginaAtual = i;
        fetchProdutos(paginaAtual, searchInput.value.trim());
      });

      paginacaoContainer.appendChild(btn);
    }
  }

  // Event Listeners
  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = tabelaBody.querySelectorAll('.produto-checkbox');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  searchInput.addEventListener('input', (e) => {
    paginaAtual = 1;
    fetchProdutos(paginaAtual, e.target.value.trim());
  });

  searchButton.addEventListener('click', () => {
    paginaAtual = 1;
    fetchProdutos(paginaAtual, searchInput.value.trim());
  });

  // Carrega dados iniciais
  fetchProdutos(paginaAtual);

  //codigo que aplica os filtros
  function aplicarFiltro(tipo) {
    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    switch (tipo) {
      case 'Em Estoque':
        listaAtual = produtos.filter((p) => p.stockInfo.quantityInStock > 0);
        break;
      case 'Vencidos':
        listaAtual = produtos.filter((p) => {
          const venc = new Date(p.validityInfo.productValidity.split('/').reverse().join('-'));
          return venc < hoje;
        });
        break;
      case 'A Vencer':
        listaAtual = produtos.filter((p) => {
          const venc = new Date(p.validityInfo.productValidity.split('/').reverse().join('-'));
          return venc >= hoje && venc <= trintaDias;
        });
        break;
      default:
        listaAtual = [...produtos];
    }

    paginaAtual = 1;
    renderizarProdutos(listaAtual);
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      updateIndicator(button);
      aplicarFiltro(button.textContent.trim());
    });
  });

  function updateIndicator(button) {
    const buttonRect = button.getBoundingClientRect();
    const containerRect = filterNav.getBoundingClientRect();
    const offsetLeft = buttonRect.left - containerRect.left + filterNav.scrollLeft;

    activeIndicator.style.width = `${button.offsetWidth}px`;
    activeIndicator.style.transform = `translateX(${offsetLeft}px)`;
  }

  const initialActive = document.querySelector('.filter.active');
  if (initialActive) {
    updateIndicator(initialActive);
    aplicarFiltro(initialActive.textContent.trim());
  }

  filterNav.addEventListener('scroll', () => {
    const activeButton = document.querySelector('.filter.active');
    if (activeButton) {
      updateIndicator(activeButton);
    }
  });
});
