const asyncHandler = require("express-async-handler");

const fetchAIChatRoutes = asyncHandler(async (req, res) => {
  const { messages } = req.body; // entire chat history [{role, text}]

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        })
      }
    );

    const data = await response.json();
    res.json({ reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { fetchAIChatRoutes };