import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Root check
app.get("/", (req, res) => {
  res.json({ status: "Server aktif 🚀" });
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("BODY MASUK:", req.body);

    // Ambil URL gambar dari attachment (sesuaikan dengan format LiveChat)
    const imageUrl =
      req.body.message?.attachments?.[0]?.url ||
      req.body.attachments?.[0]?.url;

    if (!imageUrl) {
      return res.json({ reply: null }); // tidak balas kalau bukan gambar
    }

    // Kirim gambar ke OpenAI Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Apakah gambar ini mengandung konten seksual atau kekerasan? Jawab YA atau TIDAK saja." },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ]
    });

    const result = response.choices[0].message.content;

    if (result.includes("YA")) {
      return res.json({
        reply: "⚠️ Gambar tidak diperbolehkan karena mengandung konten sensitif."
      });
    } else {
      return res.json({
        reply: "✅ Gambar aman."
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
