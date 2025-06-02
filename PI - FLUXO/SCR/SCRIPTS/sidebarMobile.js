// === SideBar Mobile ===

document
  .getElementById("open-mobile-btn")
  .addEventListener("click", function () {
    document
      .querySelector("#mobile-side-bar .content")
      .classList.toggle("active");
  });
