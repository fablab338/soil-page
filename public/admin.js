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
let activityCursorPos = 0;

// 新規投稿 textarea のカーソル位置保存
activityEditor.addEventListener("click", () => {
    activityCursorPos = activityEditor.selectionStart;
});

activityEditor.addEventListener("keyup", () => {
    activityCursorPos = activityEditor.selectionStart;
});

// 画像選択ボタン
imageInsertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    activityCursorPos = activityEditor.selectionStart;
    editorImage.click();
});

// 新規投稿：画像アップロードしてカーソル位置に挿入
editorImage.addEventListener("change", async () => {
    const file = editorImage.files[0];
    if (!file) return;

    const width = document.getElementById("imgWidth").value || 400;
    const height = document.getElementById("imgHeight").value || "auto";
    const layout = document.getElementById("imageLayout").value || "single";

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://soil-page.onrender.com/upload-editor-image", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    const imageCode = `[img:${data.imageUrl}:${width}:${height}:${layout}]\n`;

    activityEditor.value =
        activityEditor.value.substring(0, activityCursorPos) +
        imageCode +
        activityEditor.value.substring(activityCursorPos);

    activityEditor.focus();
    activityEditor.selectionStart =
    activityEditor.selectionEnd =
        activityCursorPos + imageCode.length;

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

    const res = await fetch("https://soil-page.onrender.com/post-activity", {
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
    const res = await fetch("https://soil-page.onrender.com/activity-posts");
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

            <input type="file" class="edit-image-input" accept="image/*" hidden>

            <button class="insert-image-btn">画像追加</button>
            <button class="update-btn">更新</button>
            <button class="delete-btn">削除</button>
        `;

        const imageInput = div.querySelector(".edit-image-input");
        const insertImageBtn = div.querySelector(".insert-image-btn");
        const titleInput = div.querySelector(".title-input");
        const contentInput = div.querySelector(".content-input");
        const updateBtn = div.querySelector(".update-btn");
        const deleteBtn = div.querySelector(".delete-btn");

        let editCursorPos = 0;

        contentInput.addEventListener("click", () => {
            editCursorPos = contentInput.selectionStart;
        });

        contentInput.addEventListener("keyup", () => {
            editCursorPos = contentInput.selectionStart;
        });

        insertImageBtn.addEventListener("click", () => {
            editCursorPos = contentInput.selectionStart;
            imageInput.click();
        });

        imageInput.addEventListener("change", async () => {
            const file = imageInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("https://soil-page.onrender.com/upload-editor-image", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            const layout = document.getElementById("imageLayout").value || "single";

            const imageCode =
            `[img:${data.imageUrl}:400:auto:${layout}]\n`;

            contentInput.value =
                contentInput.value.substring(0, editCursorPos) +
                imageCode +
                contentInput.value.substring(editCursorPos);

            contentInput.focus();
            contentInput.selectionStart =
            contentInput.selectionEnd =
                editCursorPos + imageCode.length;

            imageInput.value = "";
        });

        updateBtn.addEventListener("click", async () => {
            const formData = new FormData();

            formData.append("title", titleInput.value);
            formData.append("content", contentInput.value);

            const res = await fetch(
                `https://soil-page.onrender.com/activity-posts/${post._id}`,
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

    await fetch(`https://soil-page.onrender.com/activity-posts/${deleteTargetId}`, {
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