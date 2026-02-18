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
Kamu adalah sistem klasifikasi gambar.
Jawab hanya salah satu kata berikut saja tanpa tambahan apapun:
BUKTI_TRANSFER
KONTEN_SENSITIF
AMAN

Aturan:
- Jika gambar adalah bukti transfer bank, bukti pembayaran, screenshot m-banking → jawab BUKTI_TRANSFER
- Jika gambar mengandung pornografi, ketelanjangan, kekerasan → jawab KONTEN_SENSITIF
- Selain itu → jawab AMAN
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

    // 🔥 HANDLE HASIL
    if (result === "BUKTI_TRANSFER") {
      return res.json({
        reply: "✅ Bukti transfer diterima. Anda akan segera dihubungkan ke agent.",
        transfer_to_agent: true
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
