console.log("読み込まれた");

document.addEventListener("DOMContentLoaded", () => {

    // ======================
    // ログイン
    // ======================
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch("http://127.0.0.1:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "suedazemi.html";
        }
    });

});

const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.textContent = "非表示";
    } else {
        password.type = "password";
        togglePassword.textContent = "表示";
    }
});

document.getElementById("forgotLink").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "forgot-password.html";
});