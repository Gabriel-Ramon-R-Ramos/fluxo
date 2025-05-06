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

// Função para alternar a sidebar e ajustar os elementos
function toggleSidebar() {
  sideBar.classList.toggle("open");
  wrapper.classList.toggle("open");
}

// Evento de clique no botão do menu
burguerButton.addEventListener("click", toggleSidebar);
