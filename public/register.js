console.log("register.js 読み込み成功");

document
.getElementById("registerBtn")

.addEventListener(
    "click",
    async () => {

    const name =
        document.getElementById("name").value;

    const grade =
        document.getElementById("grade").value;

    const faculty =
        document.getElementById("faculty").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const password1 =
        document.getElementById("password1").value;

    // パスワード確認
    if (password !== password1) {

        document.getElementById(
            "errorMessage"
        ).textContent =
            "パスワードが一致しません";

        return;
    }

    try {

        const res = await fetch(
            "http://localhost:3000/register",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                    name,
                    grade,
                    faculty,
                    email,
                    password

                })
            }
        );

        const data = await res.json();

        document.getElementById(
            "errorMessage"
        ).textContent = data.message;

        console.log(data);

    } catch (err) {

        console.log(err);

        document.getElementById(
            "errorMessage"
        ).textContent =
            "通信エラー";
    }
});

const togglePassword =
    document.getElementById("togglePassword");

const password =
    document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.textContent = "非表示";

    } else {

        password.type = "password";

        togglePassword.textContent = "表示";
    }
});


const togglePassword1 =
    document.getElementById("togglePassword1");

const password1 =
    document.getElementById("password1");

togglePassword1.addEventListener("click", () => {

    if (password1.type === "password") {

        password1.type = "text";

        togglePassword1.textContent = "非表示";

    } else {

        password1.type = "password";

        togglePassword1.textContent = "表示";
    }
});