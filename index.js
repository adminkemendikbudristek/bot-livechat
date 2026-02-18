import express from "express";
import axios from "axios";
import OpenAI from "openai";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// OpenAI Setup
// ===============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===============================
// Root Check
// ===============================
app.get("/", (req, res) => {
  res.send("Server aktif");
});

// ===============================
// Webhook Verification (Challenge)
// ===============================
app.get("/webhook", (req, res) => {
  const challenge = req.query.challenge;

  if (challenge) {
    return res.send(challenge);
  }

  res.send("Webhook aktif");
});

// ===============================
// Webhook Receiver
// ===============================
app.post("/webhook", async (req, res) => {
  console.log("===== WEBHOOK MASUK =====");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Ambil pesan user (sesuaikan jika struktur beda)
    const userMessage =
      req.body?.message?.text ||
      req.body?.text ||
      "Halo";

    // Kirim ke OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah customer service profesional, ramah, dan membantu customer dengan jelas."
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    const aiReply = completion.choices[0].message.content;

    console.log("AI REPLY:", aiReply);

    // ===============================
    // KIRIM BALASAN KE MYLIVECHAT
    // ===============================
    // ⚠️ GANTI DENGAN ENDPOINT RESMI MYLIVECHAT
    /*
    await axios.post(
      "https://api.mylivechat.com/v1/messages",
      {
        text: aiReply,
        // tambahkan chat_id atau visitor_id jika diperlukan
      },
      {
        headers: {
          Authorization: "Bearer API_KEY_MYLIVECHAT_KAMU",
          "Content-Type": "application/json"
        }
      }
    );
    */

  } catch (error) {
    console.log("ERROR:", error.message);
  }

  // WAJIB balas kosong supaya webhook tidak error
  res.status(200).json({});
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port " + PORT);
});
