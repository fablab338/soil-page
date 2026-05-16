const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

// ファイル・写真アップロード用
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static("public"));
app.use("/uploads", express.static("public/uploads"));

// ルートパスの設定
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/suedazemi.html"));
});

// =========================
// MongoDB接続
// =========================

const MONGO_URI = process.env.MONGODB_URI || "";

mongoose.connect(MONGO_URI)
.then(() => {
    console.log("MongoDB接続成功");
})
.catch(err => {
    console.log("MongoDB接続エラー:", err);
});


// =========================
// Userモデル
// =========================

const userSchema = new mongoose.Schema({

    name: String,

    faculty: String,

    grade: String,

    email: String,

    password: String,

    imageWidth: String,

    role: {
        type: String,
        default: "user"
    },

    useOtp: {
        type: Boolean,
        default: false
    }

});

const User = mongoose.model(
    "User",
    userSchema
);


// =========================
// OTP保存
// =========================

const otpStore = {};


// =========================
// Gmail送信
// =========================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// =========================
// 新規登録
// =========================

app.post("/register", async (req, res) => {

    try {

        const {
            name,
            faculty,
            grade,
            email,
            password
        } = req.body;

        // 重複確認
        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                message: "既に登録済み"
            });
        }

        // パスワード暗号化
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // 保存
        const user = new User({

            name,
            faculty,
            grade,
            email,

            password: hashedPassword,

            role: "user",

            useOtp: false

        });

        await user.save();

        res.json({
            message: "登録成功"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "サーバーエラー"
        });
    }
});


// =========================
// ログイン
// =========================

app.post("/login", async (req, res) => {

    try {

        const email =
            req.body.email.trim();

        const password =
            req.body.password.trim();

        const user =
            await User.findOne({
                email: email
            });

        if (!user) {

            return res.status(401).json({
                message: "ユーザーなし"
            });
        }

        // =====================
        // OTPログイン
        // =====================

        if (user.useOtp) {

            const data =
                otpStore[email];

            if (!data) {

                return res.status(401).json({
                    message: "コードなし"
                });
            }

            if (Date.now() > data.expires) {

                return res.status(401).json({
                    message: "期限切れ"
                });
            }

            if (Number(password) !== data.otp) {

                return res.status(401).json({
                    message: "コード違う"
                });
            }

            delete otpStore[email];

        } else {

            // =====================
            // 通常ログイン
            // =====================

            const isMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!isMatch) {

                return res.status(401).json({
                    message: "パスワード違う"
                });
            }
        }

        const token = jwt.sign(

            {
                id: user.id,
                role: user.role,
                email: user.email
            },

            process.env.JWT_SECRET || "secretKey",

            {
                expiresIn: "1h"
            }
        );

        res.json({

            message: "ログイン成功",

            token,

            role: user.role
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "サーバーエラー"
        });
    }
});

const crypto = require("crypto");

const resetTokens = {};


// =========================
// パスワード再設定メール送信
// =========================
app.post("/request-reset", async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.findOne({
            name: name,
            email: email
        });

        if (!user) {
            return res.status(400).json({
                message: "氏名またはメールアドレスが違います"
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        resetTokens[token] = {
            email: email,
            expires: Date.now() + 3600000
        };

        const resetLink =
            `https://soil-page.onrender.com/reset-password?token=${token}`;

        await transporter.sendMail({
            from: "amayu5610@gmail.com",
            to: email,
            subject: "パスワード再設定",
            text:
                `以下のリンクからパスワードを再設定してください。\n\n${resetLink}`
        });

        res.json({
            message: "再設定メールを送信しました"
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "サーバーエラー"
        });
    }
});

app.get("/reset-password", (req, res) => {
    const token = req.query.token;

    res.send(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title>パスワード再設定</title>
        </head>
        <body>
            <h2>新しいパスワードを入力</h2>

            <input
                type="password"
                id="newPassword"
                placeholder="新しいパスワード"
            >

            <button onclick="resetPassword()">
                再設定する
            </button>

            <p id="message"></p>

            <script>
                async function resetPassword() {
                    const newPassword =
                        document.getElementById("newPassword").value;

                    const res = await fetch("/reset-password", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: "${token}",
                            newPassword
                        })
                    });

                    const data = await res.json();

                    document.getElementById("message").textContent =
                        data.message;
                }
            </script>
        </body>
        </html>
    `);
});


// =========================
// 新しいパスワード保存
// =========================
app.post("/reset-password", async (req, res) => {

    try {

        const {
            token,
            newPassword
        } = req.body;

        const data =
            resetTokens[token];

        if (!data) {
            return res.status(400).json({
                message: "無効なリンク"
            });
        }

        if (Date.now() > data.expires) {

            delete resetTokens[token];

            return res.status(400).json({
                message: "期限切れ"
            });
        }

        const user =
            await User.findOne({
                email: data.email
            });

        if (!user) {
            return res.status(400).json({
                message: "ユーザーが見つかりません"
            });
        }

        // 新パスワード暗号化
        user.password =
            await bcrypt.hash(
                newPassword,
                10
            );

        await user.save();

        delete resetTokens[token];

        res.json({
            message: "パスワード変更完了"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "サーバーエラー"
        });
    }
});

const activitySchema = new mongoose.Schema({
    title: String,
    content: String,
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ActivityPost = mongoose.model(
    "ActivityPost",
    activitySchema
);


// =========================
// 活動投稿
// =========================
app.post("/post-activity", upload.array("images", 10), async (req, res) => {
    try {
        const { title, content } = req.body;

        const images = req.files
            ? req.files.map(file => `/uploads/${file.filename}`)
            : [];

        const post = new ActivityPost({
            title,
            content,
            images
        });

        await post.save();

        res.json({
            message: "投稿成功"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "投稿失敗"
        });
    }
});


// =========================
// 活動取得
// =========================
app.get("/activity-posts", async (req, res) => {
    try {
        const posts = await ActivityPost.find()
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "取得失敗"
        });
    }
});


// =========================
// 活動投稿を編集
// =========================
app.put("/activity-posts/:id", upload.array("images", 10), async (req, res) => {
    try {
        const { title, content } = req.body;

        const updateData = {
            title,
            content
        };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(
                file => `/uploads/${file.filename}`
            );
        }

        await ActivityPost.findByIdAndUpdate(
            req.params.id,
            updateData
        );

        res.json({
            message: "編集完了"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "編集失敗"
        });
    }
});


// =========================
// 活動投稿を削除
// =========================
app.delete("/activity-posts/:id", async (req, res) => {
    try {
        await ActivityPost.findByIdAndDelete(req.params.id);

        res.json({
            message: "削除完了"
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "削除失敗"
        });
    }
});

app.post("/upload-editor-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "画像がありません"
        });
    }

    res.json({
        imageUrl: `/uploads/${req.file.filename}`
    });
});

app.get("/test-route", (req, res) => {
    res.send("Server is running correctly!");
});

app.listen(PORT, () => {
    console.log(`[VERIFIED] Server started on http://localhost:${PORT}`);
});
