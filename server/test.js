import express from "express";
const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  console.log("GET / hit");
  res.send("Server is alive!");
});

app.post("/translate", (req, res) => {
  console.log("POST /translate hit with:", req.body);
  res.json({ translation: `Echo: ${req.body.text} -> ${req.body.targetLang}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
