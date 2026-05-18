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
            <section class="activity-card">

                <h2 class="heading-14">${post.title}</h2>

                <p class="activity-date">${date}</p>

                <p class="activity-preview">
                    ${post.content
                .replace(/\[img:.*?\]/g, "")
                .substring(0, 120)}...
                </p>

                <button 
                    class="detail-btn"
                    onclick="toggleDetail(this)">
                    詳細を見る
                </button>

                <div class="activity-detail" style="display:none;">
                    <p>${formattedContent}</p>
                </div>

            </section>
        `;
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>活動投稿を取得できませんでした。</p>";
    }
}

function toggleDetail(button) {
    const detail = button.nextElementSibling;

    if (detail.style.display === "none") {
        detail.style.display = "block";
        button.textContent = "閉じる";
    } else {
        detail.style.display = "none";
        button.textContent = "詳細を見る";
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