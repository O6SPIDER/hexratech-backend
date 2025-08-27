const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local dev
      "http://localhost:3000", // Another common React dev port
      "https://hexratech.vercel.app", // Production frontend
    ],
    methods: ["POST", "GET"],
  })
);

app.use(express.json());

// ✅ Root route (health check)
app.get("/", (req, res) => {
  res.send("✅ Hexratech Backend is running");
});

// ✅ API Route
app.post("/api/send-message", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validate fields
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.RECEIVER_EMAIL, // your inbox
      subject: "📩 New Message from Contact Form",
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    console.log(`✅ Email sent from ${name} <${email}>`);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT} 🚀`));
