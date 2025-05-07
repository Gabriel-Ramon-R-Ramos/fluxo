const burguerButton = document.getElementById('burguer');
const sideBar = document.querySelector('.side_bar');
const main = document.querySelector('.main');
const actionBar = document.querySelector('.action_bar');
const painelHead = document.querySelector('.painel_head');
const titulo = document.querySelector('.titulo');
const espaco_home = document.querySelector('.espaco_home');
const espaco_cadastro = document.querySelector('.espaco_cadastro');
const espaco_consulta = document.querySelector('.espaco_consulta');
const espaco_ajuda = document.querySelector('.espaco_ajuda');
const wrapper = document.querySelector('.content_wrapper');

let isEditing = false;
let produtoId = null;

// Função para alternar a sidebar e ajustar os elementos
function toggleSidebar() {
	sideBar.classList.toggle('open');
	wrapper.classList.toggle('open');
}

// Evento de clique no botão do menu
burguerButton.addEventListener('click', toggleSidebar);

// --------- Código para as abas e modo de edição ---------
document.addEventListener('DOMContentLoaded', () => {
	toggleModo(false); // Começa no modo de visualização

	const urlParams = new URLSearchParams(window.location.search);
	produtoId = urlParams.get('id');

	const editarButton = document.getElementById('editar');
	if (produtoId) {
		editarButton.textContent = 'Editar';
		carregarDadosProduto(produtoId);
	}

	const filters = document.querySelectorAll('.filter');
	const activeIndicator = document.querySelector('.active-indicator');
	const filterNav = document.querySelector('.filter-nav');

	function updateIndicator(button) {
		const buttonRect = button.getBoundingClientRect();
		const navRect = filterNav.getBoundingClientRect();
		const offsetLeft = buttonRect.left - navRect.left + filterNav.scrollLeft;

		activeIndicator.style.width = `${button.offsetWidth}px`;
		activeIndicator.style.transform = `translateX(${offsetLeft}px)`;
	}

	const initialActive = document.querySelector('.filter.active');
	if (initialActive) updateIndicator(initialActive);

	filters.forEach((btn) => {
		btn.addEventListener('click', () => {
			filters.forEach((b) => b.classList.remove('active'));
			btn.classList.add('active');
			updateIndicator(btn);
			toggleModo(isEditing); // Respeita o modo atual
		});
	});

	filterNav.addEventListener('scroll', () => {
		const currentActive = document.querySelector('.filter.active');
		if (currentActive) updateIndicator(currentActive);
	});
});

// Função para alternar visualização/edição
function toggleModo(editar) {
	isEditing = editar;

	document.getElementById('editar').classList.toggle('hidden', editar);
	document.getElementById('voltar').classList.toggle('hidden', editar);
	document.getElementById('salvar').classList.toggle('hidden', !editar);
	document.getElementById('cancelar').classList.toggle('hidden', !editar);

	document.querySelectorAll('.aba').forEach((el) => el.classList.remove('aba_active'));

	const activeFilter = document.querySelector('.filter.active');
	const filtro = activeFilter.dataset.target;

	if (editar) {
		// Esconde a aba de estoque e força dados gerais se necessário
		document.querySelectorAll('.filter').forEach((btn) => {
			if (btn.dataset.target === 'dados_estoque') {
				btn.classList.add('hidden'); // 👈 Nova classe para esconder
			}
		});

		if (filtro === 'dados_estoque') {
			const dadosGeraisBtn = document.querySelector('[data-target="dados_gerais"]');
			dadosGeraisBtn.click();
		}
	} else {
		// Mostra a aba de estoque novamente
		document.querySelectorAll('.filter').forEach((btn) => {
			if (btn.dataset.target === 'dados_estoque') {
				btn.classList.remove('hidden');
			}
		});
	}

	const idParaMostrar = editar ? filtro : `${filtro}_visualizar`;
	document.getElementById(idParaMostrar).classList.add('aba_active');
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
		window.location.href = 'Controle_Estoque.html';
	}, 200);
}

// ------------ Funções Adicionada ------------ //

// Função para carregar dados do produto
async function carregarDadosProduto(id) {
	try {
		// Faz uma requisição GET para obter os dados do produto
		const response = await fetch(`https://api-fluxo.onrender.com/produtos/consulta/${id}`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`, // Autenticação
			},
		});

		// Verifica se a resposta foi bem-sucedida
		if (!response.ok) throw new Error('Produto não encontrado');

		// Obtém os dados do produto em formato JSON
		const produto = await response.json();
		// Preenche o formulário e a visualização com os dados
		preencherFormulario(produto);
		preencherVisualizacao(produto);
	} catch (error) {
		// Caso ocorra um erro, exibe o erro e uma mensagem ao usuário
		console.error('Erro ao carregar produto:', error);
		alert('Erro ao carregar dados do produto');
	}
}

// Função para preencher o formulário com os dados do produto
function preencherFormulario(produto) {
	preencherCampo('nome_produto', produto.productInfo.productName);
	preencherCampo('SKU', produto.productInfo.productSKU);
	preencherCampo('descricao', produto.productInfo.productDescription);
	preencherCampo('categoria', produto.productInfo.productCategory);
	preencherCampo('marca', produto.productInfo.productBrand);
	preencherCampo('modelo', produto.productInfo.productModel);
	preencherCampo('preco_venda', produto.priceInfo.productPrice?.toFixed(2));
	preencherCampo('preco_promocional', produto.priceInfo.promotionalPrice?.toFixed(2));
	preencherCampo('largura', produto.technicalInfo.productWidth);
	preencherCampo('altura', produto.technicalInfo.productHeight);
	preencherCampo('comprimento', produto.technicalInfo.productLength);
	preencherCampo('peso', produto.technicalInfo.productWeight);
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
	if (elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA') {
		elemento.value = valor || '';
	} else {
		elemento.textContent = valor || 'N/A';
	}
}

// Função para preencher a visualização com os dados do produto
function preencherVisualizacao(produto) {
	// Preenche os campos de visualização com os dados do produto
	document.querySelectorAll('.coluna_visu div').forEach((el) => {
		const label = el.previousElementSibling.textContent.trim();

		switch (label) {
			case 'Nome do Produto':
				el.textContent = produto.productInfo.productName;
				break;
			case 'SKU':
				el.textContent = produto.productInfo.productSKU;
				break;
			case 'Descrição':
				el.textContent = produto.productInfo.productDescription;
				break;
			case 'Categoria':
				el.textContent = produto.productInfo.productCategory;
				break;
			case 'Marca':
				el.textContent = produto.productInfo.productBrand;
				break;
			case 'Modelo':
				el.textContent = produto.productInfo.productModel;
				break;
			case 'Preço Venda':
				el.textContent = `R$ ${produto.priceInfo.productPrice.toFixed(2)}`;
				break;
			case 'Preço Promocional':
				el.textContent = produto.priceInfo.promotionalPrice
					? `R$ ${produto.priceInfo.promotionalPrice.toFixed(2)}`
					: 'N/A';
				break;
		}
	});

	// Preenche os campos técnicos com as dimensões e peso
	document.querySelectorAll('.dimensoes_peso .coluna').forEach((coluna) => {
		const label = coluna.querySelector('label').textContent.trim();
		const div = coluna.querySelector('div');
		const tech = produto.technicalInfo;

		switch (label) {
			case 'Largura':
				div.textContent = `${tech.productWidth}cm`;
				break;
			case 'Altura':
				div.textContent = `${tech.productHeight}cm`;
				break;
			case 'Comprimento':
				div.textContent = `${tech.productLength}cm`;
				break;
			case 'Peso':
				div.textContent = `${tech.productWeight}kg`;
				break;
		}
	});
}

// Função para o dropdown de lotes (AJUSTE)
function updateLotInfo(selectedLotId) {
	const selectedLot = produto.lots?.find((l) => l.id === selectedLotId) || {};

	// Atualiza campos de validade/fornecedor
	preencherCampo('validade', selectedLot.expiryDate?.split('T')[0]);
	preencherCampo('nome_fornecedor', selectedLot.supplierInfo?.supplierName);
	preencherCampo('codigo_fornecedor', selectedLot.supplierInfo?.supplierCode);
}
