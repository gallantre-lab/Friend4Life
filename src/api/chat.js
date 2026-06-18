import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const { message, history } = req.body;

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const prompt = `
You are Blessy, a supportive wellness companion.

Conversation history:
${JSON.stringify(history)}

User message:
${message}

Respond helpfully.
`;

    const result = await model.generateContent(prompt);

    res.status(200).json({
      reply: result.response.text()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error"
    });
  }
}
