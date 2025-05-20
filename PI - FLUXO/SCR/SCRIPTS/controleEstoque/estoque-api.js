const URL = "https://api-fluxo.onrender.com";
const token = localStorage.getItem("token");

// === Verificações de Segurança ===

// Verifica se o existem um token
if (!token) {
  window.location.href = "https://fluxo-uqpq.onrender.com/";
}



// === Chamadas API ===


async function getProducts() {
  try {
    const response = await fetch(`${URL}/produtos/todos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Código de resposta http do servidor: ${response.status}`);
    }

    const data = await response.json();
    return data.productsInPage; // <- importante!
  } catch (error) {
    console.error(`Erro ao listar produtos: ${error}`);
  }
}


// Função para popular os selects de acesso dinamicamente
async function populateProdutoSelects() {
  const products = await getProducts();
  if (!products) return;

  const addSelect = document.getElementById("produto");

  // Limpa as opções antigas (exceto a primeira)
  addSelect.innerHTML = '<option value="">-- Escolha uma opção --</option>';

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id; // ou product.productSKU se preferir
    option.textContent = product.productName;
    addSelect.appendChild(option);
  });
}
