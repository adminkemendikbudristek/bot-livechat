import express from "express";

const app = express();

// Support JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root check
app.get("/", (req, res) => {
  res.send("Server aktif");
});

// Webhook GET (untuk challenge validation)
app.get("/webhook", (req, res) => {
  const challenge = req.query.challenge;

  if (challenge) {
    return res.send(challenge); // wajib balas challenge persis
  }

  res.send("Webhook aktif");
});

// Webhook POST (untuk menerima chat & foto)
app.post("/webhook", (req, res) => {
  console.log("===== WEBHOOK MASUK =====");
  console.log(JSON.stringify(req.body, null, 2));

  // WAJIB: balas 200 tanpa field tambahan
  res.status(200).json({});
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
