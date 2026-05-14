const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
    alert("管理者のみアクセスできます");
    window.location.href = "index.html";
}

const postActivity = document.getElementById("postActivity");
const editorImage = document.getElementById("editorImage");
const imageInsertBtn = document.getElementById("imageInsertBtn");
const activityEditor = document.getElementById("activityEditor");
const activityList = document.getElementById("activityList");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

let deleteTargetId = null;


// 画像選択ボタン
imageInsertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editorImage.click();
});


// 画像アップロードして本文にコードを挿入
editorImage.addEventListener("change", async () => {
    const file = editorImage.files[0];

    if (!file) return;

    const width = document.getElementById("imgWidth").value || 400;
    const height = document.getElementById("imgHeight").value || "auto";

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:3000/upload-editor-image", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    const imageCode = `[img:${data.imageUrl}:${width}:${height}]\n`;

    activityEditor.value += imageCode;

    editorImage.value = "";
});


// 新規投稿
postActivity.addEventListener("click", async () => {
    const title = document.getElementById("activityTitle").value;
    const content = activityEditor.value;

    if (!title || !content.trim()) {
        document.getElementById("successText").textContent =
            "タイトルと活動内容を入力してください";

        document.getElementById("successModal").classList.add("show");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    const res = await fetch("http://localhost:3000/post-activity", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    document.getElementById("successText").textContent = data.message;
    document.getElementById("successModal").classList.add("show");

    document.getElementById("activityTitle").value = "";
    activityEditor.value = "";

    loadActivityPosts();
});


// 投稿一覧
async function loadActivityPosts() {
    const res = await fetch("http://localhost:3000/activity-posts");
    const posts = await res.json();

    activityList.innerHTML = "";

    if (posts.length === 0) {
        activityList.innerHTML = "<p>まだ投稿はありません</p>";
        return;
    }

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "admin-post";

        div.innerHTML = `
            <input type="text" class="form-control title-input" value="${post.title}">

            <textarea class="form-control textarea content-input">${post.content}</textarea>

            <button class="update-btn">更新</button>
            <button class="delete-btn">削除</button>
        `;

        const titleInput = div.querySelector(".title-input");
        const contentInput = div.querySelector(".content-input");
        const updateBtn = div.querySelector(".update-btn");
        const deleteBtn = div.querySelector(".delete-btn");

        updateBtn.addEventListener("click", async () => {
            const formData = new FormData();

            formData.append("title", titleInput.value);
            formData.append("content", contentInput.value);

            const res = await fetch(
                `http://localhost:3000/activity-posts/${post._id}`,
                {
                    method: "PUT",
                    body: formData
                }
            );

            const data = await res.json();

            document.getElementById("successText").textContent = data.message;
            document.getElementById("successModal").classList.add("show");

            loadActivityPosts();
        });

        deleteBtn.addEventListener("click", () => {
            deleteTargetId = post._id;
            deleteModal.classList.add("show");
        });

        activityList.appendChild(div);
    });
}


// 削除キャンセル
cancelDelete.addEventListener("click", () => {
    deleteTargetId = null;
    deleteModal.classList.remove("show");
});


// 削除実行
confirmDelete.addEventListener("click", async () => {
    if (!deleteTargetId) return;

    await fetch(`http://localhost:3000/activity-posts/${deleteTargetId}`, {
        method: "DELETE"
    });

    deleteTargetId = null;
    deleteModal.classList.remove("show");

    loadActivityPosts();
});


// モーダル閉じる
document.getElementById("closeSuccessModal").addEventListener("click", () => {
    document.getElementById("successModal").classList.remove("show");
});


// ログアウト
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "suedazemi login.html";
});

loadActivityPosts();