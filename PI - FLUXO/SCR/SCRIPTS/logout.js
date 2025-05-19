// = === Remove o token e redireciona para a tela de login === =

// === Para Computador ===
document.getElementById("logout").addEventListener("click", () => {
  // Alerta de confirmação
  const confirmar = confirm("Deseja realmente sair?");
  if (!confirmar) return;

  // Remove o token
  localStorage.removeItem("token");

  // Redireciona para a tela de login
  window.location.href = "https://fluxo-uqpq.onrender.com/";
});

// === Para Mobile ===
document.getElementById("logout-mobile").addEventListener("click", () => {
  // Alerta de confirmação
  const confirmar = confirm("Deseja realmente sair?");
  if (!confirmar) return;

  // Remove o token
  localStorage.removeItem("token");

  // Redireciona para a tela de login
  window.location.href = "index.html";
});
