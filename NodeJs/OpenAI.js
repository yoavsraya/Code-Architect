const OpenAI = require("openai");
const path = require('path');
const conversationHistory = require('./InitAIConversation');

try {
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
} catch (error) {
  console.error('Error loading .env file:', error);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function RunAI(conversationHistory) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversationHistory
  });

  const assistantMessage = completion.choices[0].message;

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage});

  return assistantMessage;
}

module.exports = {
  RunAI,
};