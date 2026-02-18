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

// Webhook
app.post("/webhook", async (req, res) => {
  try {
    console.log("BODY MASUK:", req.body);

    const imageUrl =
      req.body.message?.attachments?.[0]?.url ||
      req.body.attachments?.[0]?.url;

    if (!imageUrl) {
      return res.json({ reply: null });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Jawab hanya salah satu:
BUKTI_TRANSFER
KONTEN_SENSITIF
AMAN

Aturan:
- Bukti transfer / pembayaran → BUKTI_TRANSFER
- Pornografi / kekerasan → KONTEN_SENSITIF
- Selain itu → AMAN
`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Klasifikasikan gambar ini." },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ]
    });

    const result = response.choices[0].message.content.trim();
    console.log("HASIL AI:", result);

    if (result === "BUKTI_TRANSFER") {
      return res.json({
        reply: "✅ Bukti transfer diterima. Anda akan segera dihubungkan ke agent."
      });
    }

    if (result === "KONTEN_SENSITIF") {
      return res.json({
        reply: "⚠️ Gambar tidak diperbolehkan karena mengandung konten sensitif."
      });
    }

    if (result === "AMAN") {
      return res.json({
        reply: "📷 Gambar diterima."
      });
    }

    return res.json({ reply: null });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
