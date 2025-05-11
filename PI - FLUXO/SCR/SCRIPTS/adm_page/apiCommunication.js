async function getUsers() {
  try {
    // Recupera o token do localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token de autenticação não encontrado.");
      return null;
    }

    const response = await fetch(
      "https://api-fluxo.onrender.com/usuarios/todos?page=0&size=10",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const allUsers = await response.json();
    return allUsers;
  } catch (error) {
    console.error("Erro ao obter todos os usuários: ", error);
    return null;
  }
}

async function populateUsers() {
  try {
    // Recupera os usuários da API
    const response = await getUsers();

    // Verifica se a resposta contém a propriedade userList
    const users = response?.userList || [];
    const totalUsers = response?.totalUsers || 0;

    // Verifica se há usuários
    if (users.length === 0) {
      console.error("Nenhum usuário encontrado.");
      return;
    }

    // Seleciona a div onde o número de usuários totais serão exibidos
    const divTotalUsers = document.querySelector(".total-user");
    // Limpa o conteúdo atual da div
    divTotalUsers.innerHTML = "";
    // Adiciona o total de usuários
    divTotalUsers.innerHTML = `${totalUsers}`;

    // Seleciona a div onde os usuários serão adicionados
    const usersWidget = document.querySelector(".users-widget");

    // Limpa o conteúdo atual da div
    usersWidget.innerHTML = "";

    // Adiciona cada usuário dinamicamente
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
  } catch (error) {
    console.error("Erro ao popular os usuários: ", error);
  }
}

// Populando os usuários ao carregar a página
populateUsers();
