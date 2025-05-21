const URL = 'https://api-fluxo.onrender.com';
const token = localStorage.getItem('token');

// === Variáveis de controle de paginação ===
let currentPage = 0;
const pageSize = 10;
let isLoading = false;
let totalPages = 1;

// === Função modificada para paginação ===
async function getProducts(page = 0, size = 10) {
  try {
    const response = await fetch(`${URL}/produtos/todos?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

    const data = await response.json();
    return {
      products: data.productsInPage.map((p) => ({ id: p.id, name: p.productName })), // Filtra apenas id e nome
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { products: [], totalPages: 0 };
  }
}

// === Função para carregar mais produtos ===
async function loadMoreProducts() {
  if (isLoading || currentPage >= totalPages) return;

  isLoading = true;
  const loader = document.createElement('option');
  loader.textContent = 'Carregando...';
  loader.disabled = true;
  produtoSelect.appendChild(loader);

  try {
    const { products, totalPages: newTotalPages } = await getProducts(currentPage, pageSize);
    totalPages = newTotalPages;

    produtoSelect.removeChild(loader);

    // Adiciona apenas nome e ID
    products.forEach((product) => {
      const option = new Option(product.name, product.id);
      produtoSelect.add(option);
    });

    currentPage++;

    // Mantém o listener apenas se houver mais páginas
    if (currentPage < totalPages) {
      addScrollListener();
    }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  } finally {
    isLoading = false;
  }
}

// === Detecção de scroll ===
function addScrollListener() {
  produtoSelect.addEventListener('scroll', async function scrollHandler() {
    const { scrollTop, scrollHeight, clientHeight } = this;

    if (scrollTop + clientHeight >= scrollHeight - 10 && currentPage < totalPages) {
      this.removeEventListener('scroll', scrollHandler);
      await loadMoreProducts();
    }
  });
}

// === Inicialização ===
const produtoSelect = document.getElementById('produto');
produtoSelect.innerHTML = '<option value="">Carregando...</option>';

// Primeiro carregamento
loadMoreProducts().then(() => {
  if (currentPage < totalPages) addScrollListener();
});
