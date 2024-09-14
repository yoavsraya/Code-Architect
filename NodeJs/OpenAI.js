const OpenAI = require("openai");
const path = require('path');
let conversationHistory = require('./InitAIConversation');


try {
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
} catch (error) {
  console.error('Error loading .env file:', error);
}
///
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function RunAI() {
  conversation = await conversationHistory.buildConversion();
  const completion = await openai.chat.completions.create({
     model: "gpt-4",
     messages: conversation
   });

  const assistantMessage = completion.choices[0].message.content;

  if (!assistantMessage) {
    console.error('Assistant message is null or undefined');
  }
  console.log("AI message is:",assistantMessage);
  conversation.push({
    role: "assistant",
    content: assistantMessage
  });

  return assistantMessage;
}

async function ExpandTopic(topic, fileContents)
{
  console.log(`Expanding topic: ${topic}`);
  console.log(`File contents length: ${fileContents.length}`);

  const userMessage = {
    role: "user",
    content: fileContents.length === 0
      ? `Please expand with exactly the same instructions on the following topic: ${topic}`
      : `Please expand with exactly the same instructions on the following topic: ${topic}\nHere are the related file's contents:\n${fileContents}`
  };

  await conversationHistory.updateConversion(userMessage);
  const conversation = await conversationHistory.getConversion();
  const completion = await openai.chat.completions.create({
     model: "gpt-4",
     messages: conversation
   });

  const assistantMessage = completion.choices[0].message.content;

  if (!assistantMessage) {
    console.error('Assistant message is null or undefined');
  }

  const assistantResponse = {
    role: "assistant",
    content: assistantMessage
  };

  await conversationHistory.updateConversion(assistantResponse);

  console.log(`Expanded message: ${assistantMessage}`);
  console.log(`After Expand conversation history: ${JSON.stringify(conversation)}`);

  return assistantMessage;
}

module.exports = {
  RunAI,
  ExpandTopic,
};