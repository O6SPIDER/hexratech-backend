const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/send-message", async (req, res) => {
const { name, email, phone, message } = req.body;
if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
}

try {
    const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
    from: `"${name}" <${email}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: "New Message from Contact Form",
    html: `<p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong><br/>${message}</p>`,
    });

    res.status(200).json({ success: true, message: "Message sent!" });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT} 🚀`));
