import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Test route
app.get("/", (req, res) => {
  console.log("GET / endpoint hit!");
  res.send("Server is alive and responding!");
});

// Translation endpoint
app.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "text and targetLang are required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional medical translator." },
        { role: "user", content: `Translate this to ${targetLang}, preserving medical terminology: ${text}` },
      ],
    });

    const translation = completion.choices[0].message.content;
    console.log("Translation:", translation);
    res.json({ translation });
  } catch (err) {
    console.error("OpenAI error:", err);  // log full error
    res.status(500).json({ error: err.message || "Translation failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
