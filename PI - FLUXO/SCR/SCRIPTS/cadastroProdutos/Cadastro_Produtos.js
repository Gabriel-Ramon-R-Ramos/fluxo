const burguerButton = document.getElementById("burguer");
const sideBar = document.querySelector(".side_bar");
const main = document.querySelector(".main");
const actionBar = document.querySelector(".action_bar");
const painelHead = document.querySelector(".painel_head");
const titulo = document.querySelector(".titulo");
const espaco_home = document.querySelector(".espaco_home");
const espaco_cadastro = document.querySelector(".espaco_cadastro");
const espaco_consulta = document.querySelector(".espaco_consulta");
const espaco_ajuda = document.querySelector(".espaco_ajuda");
const wrapper = document.querySelector(".content_wrapper");

let isEditing = false;
let productId = null;
let produtoOriginal = null;
let fornecedorId = null;

// Função para alternar a sidebar e ajustar os elementos
function toggleSidebar() {
  sideBar.classList.toggle("open");
  wrapper.classList.toggle("open");
}

// Evento de clique no botão do menu
burguerButton.addEventListener("click", toggleSidebar);

// --------- Código para as abas e modo de edição ---------
document.addEventListener("DOMContentLoaded", () => {
  // Obtenha os parâmetros da URL apenas uma vez
  const urlParams = new URLSearchParams(window.location.search);
  produtoId = urlParams.get("id");
  productId = produtoId; // Unifica as variáveis para evitar problemas

  // Configure o botão salvar
  const salvarBtn = document.getElementById("salvar");
  if (salvarBtn) {
    salvarBtn.removeAttribute("onclick");
    salvarBtn.addEventListener("click", salvarProduto);
  }
  const editarButton = document.getElementById("editar");
  if (produtoId) {
    editarButton.textContent = "Editar";
    carregarDadosProduto(produtoId);
  }

  if (produtoId) {
    // Modo de edição (o título será atualizado quando os dados forem carregados)
    document.getElementById("editar").textContent = "Editar";
    carregarDadosProduto(produtoId);
  } else {
    // Modo de inclusão
    document.querySelector(".titulo").textContent = "Novo Produto";
    document.getElementById("editar").textContent = "Incluir";
  }

  toggleModo(false); // Começa no modo de visualização

  const filters = document.querySelectorAll(".filter");
  const activeIndicator = document.querySelector(".active-indicator");
  const filterNav = document.querySelector(".filter-nav");

  function updateIndicator(button) {
    const buttonRect = button.getBoundingClientRect();
    const navRect = filterNav.getBoundingClientRect();
    const offsetLeft = buttonRect.left - navRect.left + filterNav.scrollLeft;

    activeIndicator.style.width = `${button.offsetWidth}px`;
    activeIndicator.style.transform = `translateX(${offsetLeft}px)`;
  }

  const initialActive = document.querySelector(".filter.active");
  if (initialActive) updateIndicator(initialActive);

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateIndicator(btn);
      toggleModo(isEditing); // Respeita o modo atual
    });
  });

  filterNav.addEventListener("scroll", () => {
    const currentActive = document.querySelector(".filter.active");
    if (currentActive) updateIndicator(currentActive);
  });
});

// Função para alternar visualização/edição
function toggleModo(editar) {
  isEditing = editar;

  document.getElementById("editar").classList.toggle("hidden", editar);
  document.getElementById("voltar").classList.toggle("hidden", editar);
  document.getElementById("salvar").classList.toggle("hidden", !editar);
  document.getElementById("cancelar").classList.toggle("hidden", !editar);

  document
    .querySelectorAll(".aba")
    .forEach((el) => el.classList.remove("aba_active"));

  const activeFilter = document.querySelector(".filter.active");
  const filtro = activeFilter.dataset.target;

  if (editar) {
    // Esconde a aba de estoque e força dados gerais se necessário
    document.querySelectorAll(".filter").forEach((btn) => {
      if (btn.dataset.target === "dados_estoque") {
        btn.classList.add("hidden"); // 👈 Nova classe para esconder
      }
    });

    if (filtro === "dados_estoque") {
      const dadosGeraisBtn = document.querySelector(
        '[data-target="dados_gerais"]'
      );
      dadosGeraisBtn.click();
    }
  } else {
    // Mostra a aba de estoque novamente
    document.querySelectorAll(".filter").forEach((btn) => {
      if (btn.dataset.target === "dados_estoque") {
        btn.classList.remove("hidden");
      }
    });
  }

  const idParaMostrar = editar ? filtro : `${filtro}_visualizar`;
  document.getElementById(idParaMostrar).classList.add("aba_active");

  if (!editar && produtoOriginal) {
    if (filtro === "dados_estoque") {
      // Atualiza dados de estoque quando a aba de estoque é selecionada
      preencherDadosEstoque(produtoOriginal);
    } else if (filtro === "dados_validade") {
      // Atualiza informações sobre lotes e validade
      dadosValidade();
    } else if (filtro === "dados_fornecedor") {
      // Atualiza informações sobre fornecedores
      dadosFornecedor();
    }
  }
}

// Funções auxiliares para botões
function mostrarBotoesDeEdicao() {
  toggleModo(true);
}
function esconderBotoesDeEdicao() {
  toggleModo(false);
}
function acaoBotaoVoltar() {
  toggleModo(false);
  setTimeout(() => {
    window.location.href = "Produtos.html";
  }, 200);
}

// ------------ Funções Adicionada ------------ //

// Função para carregar dados do produto
async function carregarDadosProduto(id) {
  try {
    // Faz uma requisição GET para obter os dados do produto
    const response = await fetch(
      `https://api-fluxo.onrender.com/produtos/consulta/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Autenticação
        },
      }
    );

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) throw new Error("Produto não encontrado");

    // Obtém os dados do produto em formato JSON
    const produto = await response.json();

    produtoOriginal = JSON.parse(JSON.stringify(produto)); // Armazena o produto original para comparação

    document.querySelector(".titulo").textContent =
      produto.productInfo.productName;

    // Preenche o formulário e a visualização com os dados
    preencherFormulario(produto);
    preencherVisualizacao(produto);
    preencherDadosEstoque(produto);
  } catch (error) {
    // Caso ocorra um erro, exibe o erro e uma mensagem ao usuário
    console.error("Erro ao carregar produto:", error);
    alert("Erro ao carregar dados do produto");
  }
}

// Função para preencher o formulário com os dados do produto
function preencherFormulario(produto) {
  preencherCampo("nome_produto", produto.productInfo.productName);
  preencherCampo("SKU", produto.productInfo.productSKU);
  preencherCampo("descricao", produto.productInfo.productDescription);
  preencherCampo("categoria", produto.productInfo.productCategory);
  preencherCampo("marca", produto.productInfo.productBrand);
  preencherCampo("modelo", produto.productInfo.productModel);
  preencherCampo("preco_venda", produto.priceInfo.productPrice?.toFixed(2));
  preencherCampo("largura", produto.technicalInfo.productWidth);
  preencherCampo("altura", produto.technicalInfo.productHeight);
  preencherCampo("comprimento", produto.technicalInfo.productLength);
  preencherCampo("peso", produto.technicalInfo.productWeight);
}

// Função auxiliar para preencher campos do formulário
function preencherCampo(id, valor) {
  const elemento = document.getElementById(id);

  // Verifica se o elemento existe
  if (!elemento) {
    console.error(`Elemento com ID '${id}' não encontrado!`);
    return;
  }

  // Preenche de acordo com o tipo do elemento
  if (elemento.tagName === "INPUT" || elemento.tagName === "TEXTAREA") {
    elemento.value = valor || "";
  } else {
    elemento.textContent = valor || "N/A";
  }
}

// Função para preencher a visualização com os dados do produto
function preencherVisualizacao(produto) {
  // Preenche os campos de visualização com os dados do produto
  document.querySelectorAll(".coluna_visu div").forEach((el) => {
    const label = el.previousElementSibling.textContent.trim();

    switch (label) {
      case "Nome do Produto":
        el.textContent = produto.productInfo.productName;
        break;
      case "SKU":
        el.textContent = produto.productInfo.productSKU;
        break;
      case "Descrição":
        el.textContent = produto.productInfo.productDescription;
        break;
      case "Categoria":
        el.textContent = produto.productInfo.productCategory;
        break;
      case "Marca":
        el.textContent = produto.productInfo.productBrand;
        break;
      case "Modelo":
        el.textContent = produto.productInfo.productModel;
        break;
      case "Preço Venda":
        el.textContent = `R$ ${produto.priceInfo.productPrice.toFixed(2)}`;
        break;
    }
  });

  // Preenche os campos técnicos com as dimensões e peso
  document.querySelectorAll(".dimensoes_peso .coluna").forEach((coluna) => {
    const label = coluna.querySelector("label").textContent.trim();
    const div = coluna.querySelector("div");
    const tech = produto.technicalInfo;

    switch (label) {
      case "Largura":
        div.textContent = `${tech.productWidth}cm`;
        break;
      case "Altura":
        div.textContent = `${tech.productHeight}cm`;
        break;
      case "Comprimento":
        div.textContent = `${tech.productLength}cm`;
        break;
      case "Peso":
        div.textContent = `${tech.productWeight}kg`;
        break;
    }
  });
}

// Função para o dropdown de lotes (AJUSTE)
function updateLotInfo(selectedLotId) {
  const selectedLot =
    produtoOriginal.lots?.find((l) => l.id === selectedLotId) || {}; //Adicionado "Original" em produto

  // Atualiza campos de validade/fornecedor
  preencherCampo("validade", selectedLot.expiryDate?.split("T")[0]);
  preencherCampo("nome_fornecedor", selectedLot.supplierInfo?.supplierName);
  preencherCampo("codigo_fornecedor", selectedLot.supplierInfo?.supplierId);
}

// Função para identificar apenas os campos modificados
function obterCamposModificados() {
  // Extrair valores atuais do formulário (objeto completo)
  const dadosCompletos = {
    productInfo: {
      productName: document.getElementById("nome_produto").value,
      productSKU: document.getElementById("SKU").value,
      productDescription: document.getElementById("descricao").value,
      productCategory: document.getElementById("categoria").value,
      productBrand: document.getElementById("marca").value,
      productModel: document.getElementById("modelo").value,
    },
    priceInfo: {
      productPrice: parseFloat(
        document.getElementById("preco_venda").value.replace(",", ".")
      ),
      // Mantém o valor promocional original ou usa 0 se não existir
      promotionalPrice: produtoOriginal?.priceInfo?.promotionalPrice || 0,
    },
    technicalInfo: {
      productWidth: parseFloat(document.getElementById("largura").value),
      productHeight: parseFloat(document.getElementById("altura").value),
      productLength: parseFloat(document.getElementById("comprimento").value),
      productWeight: parseFloat(document.getElementById("peso").value),
    },
  };

  // Se não temos dados originais ou estamos em inclusão, retorna objeto completo
  if (!produtoOriginal) {
    return dadosCompletos;
  }

  // Para fins de logging, identificamos quais campos foram alterados
  const camposAlterados = {};

  // Verifica alterações em productInfo
  const infoModificado = {};
  let temModificacaoInfo = false;

  for (const campo in dadosCompletos.productInfo) {
    if (
      dadosCompletos.productInfo[campo] !== produtoOriginal.productInfo[campo]
    ) {
      infoModificado[campo] = dadosCompletos.productInfo[campo];
      temModificacaoInfo = true;
    }
  }

  if (temModificacaoInfo) {
    camposAlterados.productInfo = infoModificado;
  }

  // Verifica alterações em priceInfo
  const priceModificado = {};
  let temModificacaoPrice = false;

  if (
    dadosCompletos.priceInfo.productPrice !==
    produtoOriginal.priceInfo.productPrice
  ) {
    priceModificado.productPrice = dadosCompletos.priceInfo.productPrice;
    temModificacaoPrice = true;
  }

  if (temModificacaoPrice) {
    camposAlterados.priceInfo = priceModificado;
  }

  // Verifica alterações em technicalInfo
  const techModificado = {};
  let temModificacaoTech = false;

  for (const campo in dadosCompletos.technicalInfo) {
    if (
      dadosCompletos.technicalInfo[campo] !==
      produtoOriginal.technicalInfo[campo]
    ) {
      techModificado[campo] = dadosCompletos.technicalInfo[campo];
      temModificacaoTech = true;
    }
  }

  if (temModificacaoTech) {
    camposAlterados.technicalInfo = techModificado;
  }

  // Mostra no console apenas os campos que realmente mudaram (para debug)
  console.log("Campos modificados:", camposAlterados);

  // Retorna o objeto completo para garantir compatibilidade com a API
  return dadosCompletos;
}

// Função para exibir dados do fornecedor
async function dadosFornecedor() {
  try {
    const response = await fetch(
      `https://api-fluxo.onrender.com/fornecedores/${fornecedorId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Fornecedor não encontrado");

    const fornecedor = await response.json();
    preencherCampo;
  } catch (error) {
    console.error("Erro ao carregar fornecedor:", error);
    alert("Erro ao carregar dados do fornecedor");
  }
}

/* ------- Função de POST e PACTH ------- */
async function salvarProduto() {
  try {
    // Unifica os nomes de variável para evitar problemas
    const idProduto = produtoId || productId;

    // Determina se é novo (POST) ou edição (PATCH)
    const url = idProduto
      ? `https://api-fluxo.onrender.com/produtos/atualizar/${idProduto}`
      : "https://api-fluxo.onrender.com/produtos/cadastrar";

    const method = idProduto ? "PATCH" : "POST";

    // Para POST, envia o produto completo
    // Para PATCH, envia apenas os campos modificados
    const dadosParaEnviar =
      method === "PATCH"
        ? obterCamposModificados()
        : {
            productInfo: {
              productName: document.getElementById("nome_produto").value,
              productSKU: document.getElementById("SKU").value,
              productDescription: document.getElementById("descricao").value,
              productCategory: document.getElementById("categoria").value,
              productBrand: document.getElementById("marca").value,
              productModel: document.getElementById("modelo").value,
            },
            priceInfo: {
              productPrice: parseFloat(
                document.getElementById("preco_venda").value.replace(",", ".")
              ),
            },
            technicalInfo: {
              productWidth: parseFloat(
                document.getElementById("largura").value
              ),
              productHeight: parseFloat(
                document.getElementById("altura").value
              ),
              productLength: parseFloat(
                document.getElementById("comprimento").value
              ),
              productWeight: parseFloat(document.getElementById("peso").value),
            },
          };

    // Verifica se há campos para atualizar no caso de PATCH
    if (method === "PATCH" && Object.keys(dadosParaEnviar).length === 0) {
      alert("Nenhuma alteração detectada!");
      esconderBotoesDeEdicao();
      return;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(dadosParaEnviar),
    });

    if (!response.ok) throw new Error("Erro ao salvar produto");

    const data = await response.json();
    alert(data.message || "Produto salvo com sucesso!");

    // Após salvar, atualizamos o produto original com os novos valores
    if (method === "PATCH" && produtoOriginal) {
      // Atualiza apenas os campos que foram modificados
      for (const categoria in dadosParaEnviar) {
        for (const campo in dadosParaEnviar[categoria]) {
          produtoOriginal[categoria][campo] = dadosParaEnviar[categoria][campo];
        }
      }
    }

    // Volta para o modo de visualização
    esconderBotoesDeEdicao();

    // Atualiza a visualização
    if (idProduto) {
      preencherVisualizacao(produtoOriginal || dadosParaEnviar);
    } else {
      // Se foi inclusão, redireciona
      setTimeout(() => {
        window.location.href = "Controle_Estoque.html";
      }, 500);
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "Erro ao salvar produto");
  }
}

/* ------- Funções para Carregar lotes ------- */
async function dadosValidade() {
  try {
    // Verifica se temos um produto carregado
    if (!produtoId) {
      console.log("ID do produto não disponível");
      return;
    }

    // Se já temos os dados do produto carregados, usa os lotes existentes
    if (produtoOriginal && produtoOriginal.lots) {
      preencherDadosLotes(produtoOriginal.lots);
    } else {
      // Caso contrário, busca o produto para obter os lotes
      await obterLotesPorProdutoId(produtoId);
    }
  } catch (error) {
    console.error("Erro ao carregar dados de validade:", error);
    alert("Não foi possível carregar os dados de lotes");
  }
}

async function obterLotesPorProdutoId(produtoId) {
  try {
    const response = await fetch(
      `https://api-fluxo.onrender.com/produtos/consulta/${produtoId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Erro ao buscar produto");

    const produto = await response.json();
    const lotes = produto.lots || [];

    console.log(
      `Encontrados ${lotes.length} lotes para o produto ${produtoId}`
    );

    // Preenche os dados dos lotes na interface
    preencherDadosLotes(lotes);

    return lotes;
  } catch (error) {
    console.error("Erro ao obter lotes:", error);
    return [];
  }
}

async function obterLotePorId(loteId) {
  try {
    // Primeiro verificamos se o lote já está disponível no produto carregado
    if (produtoOriginal && produtoOriginal.lots) {
      const loteExistente = produtoOriginal.lots.find(
        (lote) => lote.id == loteId
      );
      if (loteExistente) {
        console.log("Lote encontrado nos dados locais:", loteExistente);
        return loteExistente;
      }
    }

    const response = await fetch(
      `https://api-fluxo.onrender.com/lotes/${loteId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) throw new Error("Lote não encontrado");

    const lote = await response.json();
    return lote;
  } catch (error) {
    console.error(`Erro ao buscar lote ${loteId}:`, error);
    return null;
  }
}

function preencherDadosLotes(lotes) {
  // Preenche o seletor de lotes se existir
  const seletorLote = document.getElementById("selecionar_lote");
  if (seletorLote) {
    // Limpa as opções anteriores
    seletorLote.innerHTML = '<option value="">Selecione um lote</option>';

    // Adiciona cada lote como opção
    lotes.forEach((lote) => {
      const option = document.createElement("option");
      option.value = lote.id;

      const dataValidade = formatarData(lote.expiryDate);
      option.textContent = `Lote #${
        lote.lotCode || lote.id
      } - Validade: ${dataValidade}`;

      seletorLote.appendChild(option);
    });

    // Configura o event listener para seleção de lote
    seletorLote.onchange = function () {
      if (this.value) {
        // Usa a função já existente updateLotInfo ou chama a nova função
        updateLotInfo(Number(this.value));
      }
    };
  }
}

function exibirDetalhesLote(lote) {
  // Implementação depende do seu design
  // Por exemplo, usando um modal simples:
  alert(`
    Detalhes do Lote #${lote.id}
    
    Código: ${lote.lotCode || "N/A"}
    Validade: ${formatarData(lote.expiryDate)}
    Quantidade: ${lote.remainingQuantity || 0} unidades
    Localização: ${lote.lotLocation || "Não definida"}
    Fornecedor: ${lote.supplierInfo?.supplierName || "Não informado"}
  `);
}

function formatarData(dataString) {
  if (!dataString) return "N/A";

  try {
    // Se já for uma data formatada como dd/mm/aaaa, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) return dataString;

    const data = new Date(dataString);
    return data.toLocaleDateString();
  } catch (e) {
    return "Data inválida";
  }
}

function isVencido(dataString) {
  if (!dataString) return false;

  try {
    const dataValidade = new Date(dataString);
    const hoje = new Date();
    return dataValidade < hoje;
  } catch (e) {
    return false;
  }
}

// Função para preencher os dados de estoque, validade e fornecedor na visualização
function preencherDadosEstoque(produto) {
  if (!produto) return;

  // Obtém os elementos div que contêm os valores (irmãos dos labels)
  const estoqueAtualEl = document.querySelector(
    'label[for="estoque"]'
  ).nextElementSibling;
  const estoqueMinEl = document.querySelector(
    'label[for="estoque_minimo"]'
  ).nextElementSibling;
  const localizacaoEl = document.querySelector(
    'label[for="localizacao"]'
  ).nextElementSibling;
  const validadeEl = document.querySelector(
    'label[for="validade"]'
  ).nextElementSibling;
  const nomeFornecedorEl = document.querySelector(
    'label[for="nome_fornecedor"]'
  ).nextElementSibling;
  const codigoFornecedorEl = document.querySelector(
    'label[for="codigo_fornecedor"]'
  ).nextElementSibling;
  // Preenche os elementos com os valores
  estoqueAtualEl.textContent = `${produto.lots[0].remainingQuantity} unidades`;
  estoqueMinEl.textContent = `0 unidades`;
  localizacaoEl.textContent = produto.lots[0].lotLocation;

  const loteEl = document.querySelector('label[for="lote"]').nextElementSibling;
  // Limpa o conteúdo anterior do elemento do lote
  loteEl.innerHTML = "";

  // Configura dados padrão
  let dataValidade = "Não se aplica";

  // Se houver lotes, cria um dropdown
  if (produto.lots && produto.lots.length > 0) {
    // Ordena os lotes do mais recente para o mais antigo
    const lotes = [...produto.lots];
    const lotesOrdenados = lotes.sort((a, b) => {
      const dataA = a.expiryDate ? new Date(a.expiryDate) : new Date(0);
      const dataB = b.expiryDate ? new Date(b.expiryDate) : new Date(0);
      return dataB - dataA;
    });

    // Cria o elemento select para o dropdown
    const selectLote = document.createElement("select");
    selectLote.className = "select-lote";
    selectLote.style.width = "100%px";
    selectLote.style.padding = "5px";
    selectLote.style.border = "1px solid #ccc";
    selectLote.style.borderRadius = "4px";

    // Adiciona cada lote como opção
    lotesOrdenados.forEach((lote) => {
      const option = document.createElement("option");
      option.value = lote.id;

      const codigoLote = lote.lotCode || `#${lote.id}`;
      option.textContent = codigoLote;

      // Armazena a data de validade como atributo data
      option.dataset.validade = lote.expiryDate || "";

      // Armazena o nome do fornecedor como atributo data
      option.dataset.nomeFornecedor = lote.supplierInfo?.supplierName || "";

      // Armazena o código do fornecedor como atributo data
      option.dataset.codigoFornecedor = lote.supplierInfo?.supplierId || "";

      // Armazena o estoque do lote do produto
      option.dataset.quantidadeLote = lote?.remainingQuantity || "";

      // Armazena a localização do produto daquele lote
      option.dataset.localizacaoLote = lote?.lotLocation || "";

      // Adiciona estilo para lotes vencidos
      if (isVencido(lote.expiryDate)) {
        option.style.color = "#d9534f";
      }

      selectLote.appendChild(option);
    });

    // Configura o evento de mudança
    selectLote.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const dataVal = selectedOption.dataset.validade;
      const nomeFornecedor = selectedOption.dataset.nomeFornecedor;
      const codigoFornecedor = selectedOption.dataset.codigoFornecedor;
      const quantidadeLote = selectedOption.dataset.quantidadeLote;
      const localizacaoLote = selectedOption.dataset.localizacaoLote;

      validadeEl.textContent = dataVal ? formatarData(dataVal) : "N/A";
      nomeFornecedorEl.textContent = nomeFornecedor || "Não informado";
      codigoFornecedorEl.textContent = codigoFornecedor || "N/A";
      estoqueAtualEl.textContent = quantidadeLote || 0;
      localizacaoEl.textContent = localizacaoLote || "Não informado";
    });

    // Adiciona o select à div de lote
    loteEl.appendChild(selectLote);

    // Define a data de validade inicial baseada no primeiro lote
    if (lotesOrdenados[0].expiryDate) {
      dataValidade = formatarData(lotesOrdenados[0].expiryDate);
    }
  } else {
    // Se não há lotes, exibe mensagem padrão
    loteEl.textContent = "N/A";
  }

  // Determina informações do fornecedor
  let nomeFornecedor = "Não informado";
  let codigoFornecedor = "N/A";

  // Tenta obter informações do fornecedor do produto ou do lote mais recente
  if (produto.lots && produto.lots.length > 0 && produto.lots[0].supplierInfo) {
    nomeFornecedor =
      produto.lots[0].supplierInfo.supplierName ||
      produto.lots[0].supplierInfo.nome ||
      "Não informado";
    codigoFornecedor =
      produto.lots[0].supplierInfo.supplierId ||
      produto.lots[0].supplierInfo.codigo ||
      "N/A";
  }

  // Preenche os elementos com os valores
  validadeEl.textContent = dataValidade;
  nomeFornecedorEl.textContent = nomeFornecedor;
  codigoFornecedorEl.textContent = codigoFornecedor;
}
