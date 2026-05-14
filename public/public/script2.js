
document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".navbar-nav");

  burger.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
});

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "suedazemi login.html";
});
  