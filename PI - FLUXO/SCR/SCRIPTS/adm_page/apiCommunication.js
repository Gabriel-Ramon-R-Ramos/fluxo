const searchInput = document.getElementById("search");
let paginaAtual = 1;

// Função para buscar dados da API
async function getUsersData(page = 1, size = 6, search = "") {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "index.html";
      return null;
    }

    const response = await fetch(
      `https://api-fluxo.onrender.com/usuarios/todos?page=${
        page - 1
      }&size=${size}&search=${search}`,
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
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return null;
  }
}

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
        <div id="open-modal-manage-user" class="simple-button">Gerenciar</div>
      </div>
    `;

    usersWidget.appendChild(userElement);
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

// Função para lidar com a troca de página
async function handlePageChange(page) {
  paginaAtual = page;
  const data = await getUsersData(paginaAtual);
  if (data) {
    populateUsersData(data.userList);
    renderPagination(data.totalPages);
  }
}

// Função principal para inicializar a página
async function initialize() {
  const data = await getUsersData(paginaAtual);
  if (data) {
    renderTotalUsers(data.totalUsers);
    populateUsersData(data.userList);
    renderPagination(data.totalPages);
  }
}

// Função para pesquisar
async function search(event) {
  const searchValue = event.target.value.trim();
  const data = await getUsersData(paginaAtual, undefined, searchValue);
  if (data) {
    populateUsersData(data.userList);
    renderPagination(data.totalPages);
  }
}

// Evento para pesquisar um usuário
searchInput.addEventListener("input", search);

// Inicializa a página
initialize();
