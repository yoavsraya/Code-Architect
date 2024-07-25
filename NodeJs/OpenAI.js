const OpenAI = require("openai");
const path = require('path');

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

  const assistantMessage = completion.choices[0].message.content;

  if (!assistantMessage) {
    console.error('Assistant message is null or undefined');
  }

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage
  });

  return assistantMessage;
}

async function ExpandTopic(conversationHistory, topic, fileContents) {
  console.log(`Expanding topic: ${topic}`);
  console.log(`File contents length: ${fileContents.length}`);

  const userMessage = {
    role: "user",
    content: `Please expand on the following topic: ${topic}\nHere are the related file contents:\n${fileContents}`
  };

  conversationHistory.push(userMessage);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversationHistory
  });

  const assistantMessage = completion.choices[0].message.content;

  if (!assistantMessage) {
    console.error('Assistant message is null or undefined');
  }

  const assistantResponse = {
    role: "assistant",
    content: assistantMessage
  };

  conversationHistory.push(assistantResponse);

  console.log(`Expanded message: ${assistantMessage}`);

  return assistantMessage;
}

module.exports = {
  RunAI,
  ExpandTopic
};
