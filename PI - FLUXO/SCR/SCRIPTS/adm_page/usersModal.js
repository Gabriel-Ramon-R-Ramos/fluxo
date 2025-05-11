// Seleciona o elemento pai que contém os botões
const body = document.body;

// Adiciona o evento de clique ao elemento pai
body.addEventListener("click", (event) => {
  // === Quando clica para adicionar usuários ===
  if (event.target.id === "open-modal-add-user") {
    const modal_addUser = document.getElementById("modal-add-user");
    modal_addUser.classList.toggle("active");
  }

  if (
    event.target.id === "close-modal-add-user" ||
    event.target.id === "close-modal-add-user2"
  ) {
    const modal_addUser = document.getElementById("modal-add-user");
    modal_addUser.classList.toggle("active");
  }

  // === Quando clica para gerenciar usuários ===
  if (event.target.id === "open-modal-manage-user") {
    const modal_manageUser = document.getElementById("modal-manage-user");
    modal_manageUser.classList.toggle("active");
  }

  if (
    event.target.id === "close-modal-manage-user" ||
    event.target.id === "close-modal-manage-user2"
  ) {
    const modal_manageUser = document.getElementById("modal-manage-user");
    modal_manageUser.classList.toggle("active");
  }
});
