// === Variáveis Globais ===

const URL = "https://api-fluxo.onrender.com";
const token = localStorage.getItem("token");
const searchInput = document.getElementById("search");
let paginaAtual = 1;

// === Verificações de Segurança ===

// Verifica se o existem um token
if (!token) {
  window.location.href = "index.html";
}

// === Chamadas API ===

// Função para buscar todos os usuários da API
// Retorna: todos os usuários
// page: primeira página a ser lida
// size: tamanho dos dados por página
// search: filtro de pesquisa
async function getAllUsers(page = 1, size = 6, search = "") {
  try {
    const response = await fetch(
      `${URL}/usuarios/todos?page=${page - 1}&size=${size}&search=${search}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
      }
      throw new Error(
        `Código de resposta http do servidor:  ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar os dados dos usuários:", error);
    return null;
  }
}

// Função para pegar os níveis de acesso disponíveis
// Retorna: todos os níveis de acesso (roles)
async function getRoles() {
  try {
    const response = await fetch(`${URL}/enums/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Código de resposta http do servidor: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`Erro ao pegar os níveis de acesso: ${error}`);
  }
}

// Função para pegar os dados de 1 usuário
// Retorna: os dados do usuário
// userId: indentificador do usuário
async function getUserData(userId) {
  try {
    const response = await fetch(`${URL}/usuarios/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Código de resposta http do servidor: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar os dados do usuário ${error}`);
  }
}

// Função para atualizar (PATCH) os dados de 1 usuário
// Retorno: NONE
// data: objeto javascript
async function patchUserData(userId, data) {
  try {
    const response = await fetch(`${URL}/usuarios/atualizar/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Código de resposta http do servidor: ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Erro ao atualizar os dados do usuário ${error}`);
  }
}

// Função para adicionar (POST) um novo usuário
// Retorno: NONE
// data: Objeto
export async function addUsers(data) {
  try {
    const response = await fetch(`${URL}/usuarios/cadastrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Código de resposta http do servidor: ${response.stat}`);
    }
  } catch (error) {
    console.error(`Erro ao adicionar um novo usuário ${error}`);
  }
}

// Função para deletar (DELETE) um usuário cadastradi
// Retorno: NONE
// userId: indentificador do usuário
async function deleteUsers(userId) {
  try {
    const response = await fetch(`${URL}/usuarios/apagar/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Código de resposta http do servidor: ${response.status}`
      );
    }
  } catch (error) {
    console.error(`Não foi possível deletar o usuário: ${error}`);
  }
}

// === Interações com a API ===

// Função para popular os selects de acesso dinamicamente
async function populateRolesSelects() {
  const roles = await getRoles();
  if (!roles) return;

  // Seletores dos dois selects
  const addSelect = document.getElementById("add_acesso");
  const manageSelect = document.getElementById("manage_acesso");

  // Limpa as opções antigas (exceto a primeira)
  addSelect.innerHTML = '<option value="">-- Escolha uma opção --</option>';
  manageSelect.innerHTML = '<option value="">-- Escolha uma opção --</option>';

  // Adiciona as opções vindas da API
  roles.forEach((role) => {
    const optionAdd = document.createElement("option");
    optionAdd.value = role.value;
    optionAdd.textContent =
      role.name.charAt(0) + role.name.slice(1).toLowerCase();
    addSelect.appendChild(optionAdd);

    const optionManage = document.createElement("option");
    optionManage.value = role.value;
    optionManage.textContent =
      role.name.charAt(0) + role.name.slice(1).toLowerCase();
    manageSelect.appendChild(optionManage);
  });
}

// Função inserir os dados do usuário quando clicar em gerenciar
async function insertUsersData(userId) {
  try {
    await populateRolesSelects();
    const userData = await getUserData(userId);

    // Preenche o formulário do modal com os dados do usuário
    document.getElementById("manage_name").value = userData.name;
    document.getElementById("manage_email").value = userData.email;
    document.getElementById("manage_password").value = ""; // Não exibe a senha
    document.getElementById("manage_matricula").value =
      userData.registrationNumber || "";
    document.getElementById("manage_departamento").value =
      userData.department || "";
  } catch (error) {
    console.error("Erro ao carregar os dados do usuário: ", error);
  }

  // Adiciona o evento de salvar
  const saveButton = document.querySelector("#modal-manage-user .save-btn");
  saveButton.onclick = (event) => {
    event.preventDefault();
    saveUserChanges(userId);
  };

  // Adiciona o evento de deletar
  const removeButton = document.querySelector("#modal-manage-user .remove-btn");
  removeButton.onclick = (event) => {
    event.preventDefault();
    removeUser(userId);
  };
}

// Salvar a adição de um novo usuário
export async function saveUserCreation() {
  try {
    // Coleta os dados do formulário
    const updatedUser = {
      email: document.getElementById("add_email").value,
      name: document.getElementById("add_name").value,
      password: document.getElementById("add_password").value,
      registrationNumber: document.getElementById("add_matricula").value,
      department: document.getElementById("add_departamento").value,
      role: document.getElementById("add_acesso").value.toUpperCase(),
    };

    // Atualiza os dados do usuário
    await addUsers(updatedUser);

    // Fecha o modal e atualiza a lista de usuários
    const modal = document.getElementById("modal-add-user");
    modal.classList.remove("active");
    await initialize();
  } catch (error) {
    console.error(`Erro ao criar um novo usuário ${error}`);
  }
}

// Salvar as mudanças dos dados do usuário
async function saveUserChanges(userId) {
  try {
    // Coleta os dados do formulário
    const updatedUser = {
      email: document.getElementById("manage_email").value,
      name: document.getElementById("manage_name").value,
      password: document.getElementById("manage_password").value,
      registrationNumber: document.getElementById("manage_matricula").value,
      department: document.getElementById("manage_departamento").value,
      role: document.getElementById("manage_acesso").value.toUpperCase(),
    };

    // Atualiza os dados do usuário
    await patchUserData(userId, updatedUser);

    // Fecha o modal e atualiza a lista de usuários
    const modal = document.getElementById("modal-manage-user");
    modal.classList.remove("active");
    await initialize();
  } catch (error) {
    console.error(`Erro ao salvar alterações: ${error}`);
  }
}

// Remove um usuário cadastrado
async function removeUser(userId) {
  try {
    // Remove o usuário
    await deleteUsers(userId);

    // Fecha o modal e atualiza a lista de usuários
    const modal = document.getElementById("modal-manage-user");
    modal.classList.remove("active");
    await initialize();
  } catch (error) {
    console.error(`Erro ao remover um usuário ${error}`);
  }
}

// Função para lidar com a troca de página
async function handlePageChange(page) {
  paginaAtual = page;
  const data = await getAllUsers(paginaAtual);
  if (data) {
    populateUsersData(data.userList);
    renderPagination(data.totalPages);
  }
}

// Função principal para inicializar a página
async function initialize() {
  const data = await getAllUsers(paginaAtual);
  if (data) {
    renderTotalUsers(data.totalUsers);
    populateUsersData(data.userList);
    renderPagination(data.totalPages);
    populateRolesSelects();
  }
}

// Função para pesquisar
async function search(event) {
  const searchValue = event.target.value.trim();
  const data = await getAllUsers(paginaAtual, undefined, searchValue);
  if (data) {
    populateUsersData(data.userList);
    renderPagination(data.totalPages);
  }
}

// === Funções ===

// Função para popular os dados de usuários
function populateUsersData(users) {
  const usersWidget = document.querySelector(".users-widget");
  usersWidget.innerHTML = "";

  users.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.classList.add("widget-content");

    userElement.innerHTML = `
      <div class="name">${user.name}</div>
      <div class="email">${user.email}</div>
      <div class="manage">
        <div class="access-level highlight-text">${user.role}</div>
        <div id="open-modal-manage-user"
        class="simple-button"
        data-user-id="${user.id}">Gerenciar</div>
      </div>
    `;

    usersWidget.appendChild(userElement);
  });

  // Adiciona evento de clique para abrir o modal de gerenciamento
  document.querySelectorAll("#open-modal-manage-user").forEach((button) => {
    button.addEventListener("click", (event) => {
      const userId = event.target.getAttribute("data-user-id");
      insertUsersData(userId);
    });
  });
}

// Função para renderizar o total de usuários
function renderTotalUsers(totalUsers) {
  const total = document.querySelector(".total-user");
  total.innerHTML = "";
  total.innerHTML = totalUsers;
}

// Função para renderizar a paginação
function renderPagination(totalPages) {
  const pages = document.querySelector(".pages");
  pages.innerHTML = "";
  // Para cada página cria um li que vai a ela
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.innerText = i.toString().padStart(2, "0");
    if (i === paginaAtual) li.classList.add("active");
    pages.appendChild(li);
    li.addEventListener("click", () => handlePageChange(i));
  }
}

// === Eventos Globais ===

// Evento para pesquisar um usuário
searchInput.addEventListener("input", search);

// === Inicializações ===

initialize();
