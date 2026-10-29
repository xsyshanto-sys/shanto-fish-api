
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/", (req, res) => {
  res.send("SHANTO Fish Audio API is running!");
});

app.post("/tts", async (req, res) => {
  try {
    const key = process.env.FISH_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "API key is not configured" });
    }

    const text = req.body?.text;
    if (typeof text !== "string" || !text.trim() || text.length > 2000) {
      return res.status(400).json({ error: "Text must be 1–2000 characters" });
    }

    const response = await axios.post(
      "https://api.fish.audio/v1/tts",
      {
        text: text.trim(),
        reference_id: process.env.FISH_VOICE_ID || "e3856b21a37d4a648395292b21539d45",
        format: "mp3"
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          model: "s2.1-pro-free"
        },
        responseType: "arraybuffer",
        timeout: 60000
      }
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("Fish Audio error:", err.response?.status || err.message);
    res.status(502).json({ error: "Fish Audio request failed" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SHANTO API listening on ${port}`));
