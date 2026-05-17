async function loadActivity() {
    const container = document.getElementById("activityContainer");

    try {
        const res = await fetch("https://soil-page.onrender.com/activity-posts");
        const posts = await res.json();

        container.innerHTML = "";

        if (posts.length === 0) {
            container.innerHTML = "<p>まだ活動投稿はありません。</p>";
            return;
        }

        posts.forEach(post => {
            const date = new Date(post.createdAt).toLocaleDateString("ja-JP");

            const formattedContent = post.content
                .replace(/\n/g, "<br>")
                .replace(
                    /\[img:(.*?):(\d+):(.*?)\]/g,
                    (match, url, width, height) => {
                        return `
                            <img
                                src="https://soil-page.onrender.com${url}"
                                style="
                                    width:${width}px;
                                    height:${height === "auto" ? "auto" : height + "px"};
                                    object-fit:cover;
                                    display:block;
                                    margin:20px auto;
                                    border-radius:10px;
                                "
                            >
                        `;
                    }
                );

            container.innerHTML += `
                <section class="activity-box">
                    <h2  class="heading-14">${post.title}</h2>
                    <p>${formattedContent}</p>
                    <p class="activity-date">${date}</p>
                </section>
            `;
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>活動投稿を取得できませんでした。</p>";
    }
}

loadActivity();
// 


document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "suedazemi login.html";
});
loadActivity();