import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server aktif");
});

app.post("/webhook", (req, res) => {
  console.log("Webhook masuk:");
  console.log(req.body);

  res.status(200).json({ status: "success" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});