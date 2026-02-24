require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "50kb" }));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FEEDBACK_SMTP_USER,
    pass: process.env.FEEDBACK_SMTP_APP_PASSWORD,
  },
});

app.post("/api/feedback", async (req, res) => {
  const rating = Number(req.body?.rating);
  const comment = String(req.body?.comment || "").trim();

  const safeRating = Number.isFinite(rating) ? rating : null;
  const safeComment = comment.slice(0, 2000);

  if (safeRating === null && !safeComment) {
    return res.status(400).json({ ok: false, error: "Empty feedback" });
  }

  try {
    await transporter.sendMail({
      from: `"ELIXIR Beacon Network Browser UI Feedback" <${process.env.FEEDBACK_SMTP_USER}>`,
      to: process.env.FEEDBACK_TO_EMAIL,
      subject: `Beacon Feedback (${safeRating ?? "no rating"}/5)`,
      text: `New feedback submitted via ELIXIR Beacon Network Browser

Rating: ${safeRating ?? "not provided"}/5

Comment:
${safeComment || "not provided"}
`,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Feedback email error:", err);
    return res.status(500).json({ ok: false });
  }
});

const clientBuildPath = path.join(__dirname, "../../client/build");

app.use(express.static(clientBuildPath));

app.use((req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const port = Number(process.env.PORT || 4010);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
