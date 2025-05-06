document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('.filter');
  const activeIndicator = document.querySelector('.active-indicator');
  const filterNav = document.querySelector('.filter-nav');
  const tabelaBody = document.getElementById('tabela-produtos');
  const selectAllCheckbox = document.getElementById('selectAll');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const paginacaoContainer = document.getElementById('paginacao');

  let produtos = [
      //exemplo pra ver como renderiza na  tabela
      {
        productInfo: { productName: "Shampoo Herbal", productSKU: "SHM001" },
        priceInfo: { productPrice: 19.99 },
        stockInfo: { quantityInStock: 25, minimumStock: 5 },
        validityInfo: { productValidity: "10/05/2025" }
      },
      {
        productInfo: { productName: "Condicionador Suave", productSKU: "CND002" },
        priceInfo: { productPrice: 22.5 },
        stockInfo: { quantityInStock: 0, minimumStock: 3 },
        validityInfo: { productValidity: "01/03/2024" }
      },
      {
        productInfo: { productName: "Creme Hidratante", productSKU: "CRM003" },
        priceInfo: { productPrice: 35.0 },
        stockInfo: { quantityInStock: 10, minimumStock: 5 },
        validityInfo: { productValidity: "01/05/2025" }
      },
      {
        productInfo: { productName: "Sabonete Natural", productSKU: "SBN004" },
        priceInfo: { productPrice: 8.9 },
        stockInfo: { quantityInStock: 50, minimumStock: 10 },
        validityInfo: { productValidity: "20/04/2025" }
      },
      {
        productInfo: { productName: "Álcool Gel", productSKU: "ALC005" },
        priceInfo: { productPrice: 12.0 },
        stockInfo: { quantityInStock: 2, minimumStock: 10 },
        validityInfo: { productValidity: "05/04/2025" }
      },
      {
        productInfo: { productName: "Loção Pós-barba", productSKU: "LPB006" },
        priceInfo: { productPrice: 17.5 },
        stockInfo: { quantityInStock: 15, minimumStock: 5 },
        validityInfo: { productValidity: "18/07/2025" }
      },
      {
        productInfo: { productName: "Desodorante Roll-On", productSKU: "DSR007" },
        priceInfo: { productPrice: 11.2 },
        stockInfo: { quantityInStock: 30, minimumStock: 10 },
        validityInfo: { productValidity: "22/08/2025" }
      },
      {
        productInfo: { productName: "Protetor Solar FPS 50", productSKU: "PSF008" },
        priceInfo: { productPrice: 45.0 },
        stockInfo: { quantityInStock: 12, minimumStock: 6 },
        validityInfo: { productValidity: "05/11/2025" }
      },
      {
        productInfo: { productName: "Máscara Facial", productSKU: "MSF009" },
        priceInfo: { productPrice: 29.9 },
        stockInfo: { quantityInStock: 7, minimumStock: 5 },
        validityInfo: { productValidity: "12/06/2025" }
      },
      {
        productInfo: { productName: "Esfoliante Corporal", productSKU: "EFC010" },
        priceInfo: { productPrice: 31.5 },
        stockInfo: { quantityInStock: 18, minimumStock: 8 },
        validityInfo: { productValidity: "30/09/2025" }
      },
      {
        productInfo: { productName: "Sabonete Líquido", productSKU: "SBL011" },
        priceInfo: { productPrice: 9.9 },
        stockInfo: { quantityInStock: 22, minimumStock: 10 },
        validityInfo: { productValidity: "12/12/2025" }
      },
      {
        productInfo: { productName: "Óleo Corporal", productSKU: "OLC012" },
        priceInfo: { productPrice: 27.0 },
        stockInfo: { quantityInStock: 5, minimumStock: 3 },
        validityInfo: { productValidity: "01/01/2026" }
      },
      {
        productInfo: { productName: "Gel de Banho", productSKU: "GLB013" },
        priceInfo: { productPrice: 23.5 },
        stockInfo: { quantityInStock: 19, minimumStock: 6 },
        validityInfo: { productValidity: "28/10/2025" }
      },
      {
        productInfo: { productName: "Creme para Mãos", productSKU: "CRM014" },
        priceInfo: { productPrice: 15.0 },
        stockInfo: { quantityInStock: 16, minimumStock: 4 },
        validityInfo: { productValidity: "08/08/2025" }
      },
      {
        productInfo: { productName: "Tônico Facial", productSKU: "TNF015" },
        priceInfo: { productPrice: 32.0 },
        stockInfo: { quantityInStock: 8, minimumStock: 5 },
        validityInfo: { productValidity: "14/09/2025" }
      }
    
  ];
  let listaAtual = []; // ← essa variável guarda a lista filtrada/pesquisada
  let paginaAtual = 1;
  const itensPorPagina = 10;

  // Busca os produtos da API
  fetch('https://fluxo-api-a960.onrender.com/produtos/todos')
    .then(res => res.json())
    .then(data => {
      produtos = data;
      listaAtual = [...produtos];
      renderizarProdutos(listaAtual);
    })
    .catch(error => {
      console.error('Erro ao buscar produtos:', error);
    });

  function renderizarProdutos(lista) {
    tabelaBody.innerHTML = '';

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = lista.slice(inicio, fim);

    produtosPagina.forEach(produto => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="checkbox" class="produto-checkbox"></td>
        <td>${produto.productInfo.productName}</td>
        <td>${produto.productInfo.productSKU}</td>
        <td>${produto.priceInfo.productPrice}</td>
        <td>${produto.stockInfo.quantityInStock}</td>
        <td>${produto.stockInfo.minimumStock}</td>
        <td>${produto.validityInfo.productValidity}</td>
      `;
      tabelaBody.appendChild(row);
    });

    const checkboxes = tabelaBody.querySelectorAll('.produto-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });

    renderizarPaginacao(lista.length);
  }

  function renderizarPaginacao(totalItens) {
    paginacaoContainer.innerHTML = '';
    const totalPaginas = Math.ceil(totalItens / itensPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.innerText = i.toString().padStart(2, '0');
      btn.classList.add('pagina-btn');
      if (i === paginaAtual) btn.classList.add('ativa');

      btn.addEventListener('click', () => {
        paginaAtual = i;
        renderizarProdutos(listaAtual);
      });

      paginacaoContainer.appendChild(btn);
    }
  }

  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = tabelaBody.querySelectorAll('.produto-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });

  function buscarProduto(query) {
    const resultado = produtos.filter(produto => {
      const nome = produto.productInfo.productName.toLowerCase();
      const sku = produto.productInfo.productSKU.toLowerCase();
      return nome.includes(query.toLowerCase()) || sku.includes(query.toLowerCase());
    });
    listaAtual = resultado;
    paginaAtual = 1;
    renderizarProdutos(listaAtual);
  }

  searchInput.addEventListener('input', (e) => {
    buscarProduto(e.target.value);
  });

  searchButton.addEventListener('click', () => {
    buscarProduto(searchInput.value);
  });

  function aplicarFiltro(tipo) {
    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    switch (tipo) {
      case 'Em Estoque':
        listaAtual = produtos.filter(p => p.stockInfo.quantityInStock > 0);
        break;
      case 'Vencidos':
        listaAtual = produtos.filter(p => {
          const venc = new Date(p.validityInfo.productValidity.split('/').reverse().join('-'));
          return venc < hoje;
        });
        break;
      case 'A Vencer':
        listaAtual = produtos.filter(p => {
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

  filters.forEach(button => {
    button.addEventListener('click', () => {
      filters.forEach(btn => btn.classList.remove('active'));
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
