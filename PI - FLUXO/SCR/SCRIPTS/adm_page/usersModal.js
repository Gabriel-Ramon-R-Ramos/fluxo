// === Quando clica para adicionar usuários ===
let btn_addFunc = document.getElementById("open-modal-add-user");
let btn_fechar_add = document.getElementById("close-modal-add-user");
let btn_cancelar_add = document.getElementById("close-modal-add-user2");
let modal_addUser = document.getElementById("modal-add-user");

btn_addFunc.addEventListener("click", function () {
  modal_addUser.classList.toggle("active");
});

btn_fechar_add.addEventListener("click", function () {
  modal_addUser.classList.toggle("active");
});

btn_cancelar_add.addEventListener("click", function () {
  modal_addUser.classList.toggle("active");
});

// === Quando clica para gerenciar usuários ===
let btn_gerenciar = document.getElementById("open-modal-manage-user");
let btn_fechar_manage = document.getElementById("close-modal-manage-user");
let btn_cancelar_manage = document.getElementById("close-modal-manage-user2");
let modal_manageUser = document.getElementById("modal-manage-user");

btn_gerenciar.addEventListener("click", function () {
  modal_manageUser.classList.toggle("active");
});

btn_fechar_manage.addEventListener("click", function () {
  modal_manageUser.classList.toggle("active");
});

btn_cancelar_manage.addEventListener("click", function () {
  modal_manageUser.classList.toggle("active");
});
