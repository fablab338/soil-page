console.log("password.js 読み込み成功");

document.addEventListener("DOMContentLoaded", () => {

    const resetBtn =
        document.getElementById("resetBtn");

    resetBtn.addEventListener("click", async () => {

        console.log("再設定ボタン押された");

        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        console.log("送信データ:", name, email);

        const res = await fetch(
            "http://localhost:3000/request-reset",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    name,
                    email
                })
            }
        );

        const data =
            await res.json();

        console.log(data);

        alert(data.message);
    });

});