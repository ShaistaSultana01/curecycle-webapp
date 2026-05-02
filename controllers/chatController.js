import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const fallbackReply = (message = "") => {
  const text = message.toLowerCase();
  if (text.includes("livogen")) {
    return "Livogen is an iron + folic acid supplement used for anemia and weakness.";
  }
  if (text.includes("paracetamol") || text.includes("dolo")) {
    return "Paracetamol is commonly used for fever and mild pain relief.";
  }
  return "I can help with medicine uses, expiry, dosage, side effects, fever, and basic health questions.";
};

const chatBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are CureCycle AI, a safe medicine assistant. Give short helpful answers. For serious issues advise consulting a doctor.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.4,
      });

      const reply =
        completion.choices?.[0]?.message?.content || "No response generated.";

      return res.json({ success: true, source: "openai", reply });
    } catch (aiError) {
      // 🔧 FIX #8: log error type/status so quota/auth issues are debuggable
      console.error("OpenAI Error:", {
        name: aiError?.name,
        status: aiError?.status,
        code: aiError?.code,
        message: aiError?.message,
      });
      const reply = fallbackReply(message);
      return res.json({ success: true, source: "fallback", reply });
    }
  } catch (error) {
    console.error("chatBot error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Chat failed" });
  }
};

export { chatBot };
