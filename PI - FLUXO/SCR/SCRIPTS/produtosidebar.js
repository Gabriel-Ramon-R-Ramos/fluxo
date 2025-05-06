const burguerButton = document.getElementById('burguer');
const sideBar = document.querySelector('.side_bar');
const main = document.querySelector('.home');
const espaco_home = document.querySelector('.espaco_home');
const espaco_cadastro = document.querySelector('.espaco_cadastro');
const espaco_consulta = document.querySelector('.espaco_consulta');
const espaco_ajuda = document.querySelector('.espaco_ajuda');

// Função para alternar a sidebar
function toggleSidebar() {
  sideBar.classList.toggle('open');

  if (sideBar.classList.contains('open')) {
    // Sidebar aberta
    main.style.marginLeft = '140px';
    burguerButton.style.left = 'calc(10px + 140px)';
  } else {
    // Sidebar fechada
    main.style.marginLeft = '0';
    burguerButton.style.left = '10px';
  }
}

// Evento de clique no botão hambúrguer
burguerButton.addEventListener('click', toggleSidebar);
