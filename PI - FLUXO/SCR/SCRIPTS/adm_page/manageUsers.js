// === Formulário adicionar pessoas
const formEnvio = document.getElementById("add-user");
const addName = document.getElementById("add_name").value;
const addEmail = document.getElementById("add_email").value;
const addPassword = document.getElementById("add_password").value;
const addMatricula = document.getElementById("add_matricula").value;
const addDepartamento = document.getElementById("add_departamento").value;
const addAcesso = document.getElementById("add_acesso").value;

formEnvio.addEventListener("submit", async (evento) => {
  evento.preventDefault();
});
