document.getElementById("open_btn").addEventListener("click", function () {
  document.getElementById("side-bar").classList.toggle("open-sidebar");
});

document.getElementById("close_btn").addEventListener("click", function () {
  document.getElementById("side-bar").classList.toggle("open-sidebar");
});

document
  .getElementById("open-mobile-btn")
  .addEventListener("click", function () {
    document
      .querySelector("#mobile-side-bar .content")
      .classList.toggle("active");
  });
