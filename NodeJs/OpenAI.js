const OpenAI = require("openai");
const path = require('path');
let conversationHistory = require('./InitAIConversation');
let tempAIResponseGarageManager = require('./TempAIResponseGarageManager');
let tempAIResponseExpandFactoryPattern = require('./TempAIResponseExpandFactoryPattern');

try {
  const dotenvPath = path.join(__dirname, '../.env');
  require('dotenv').config({ path: dotenvPath });
} catch (error) {
  console.error('Error loading .env file:', error);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function RunAI() {
  //const completion = await openai.chat.completions.create({
  //  model: "gpt-4o",
  //  messages: conversationHistory
  //});

  const assistantMessage = tempAIResponseGarageManager; //completion.choices[0].message.content;

  if (!assistantMessage) {
    console.error('Assistant message is null or undefined');
  }

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage
  });

  console.log(`RunAI conversation history: ${JSON.stringify(conversationHistory)}`);

  return assistantMessage;
}

async function ExpandTopic(topic, fileContents) {
  console.log(`Expanding topic: ${topic}`);
  console.log(`File contents length: ${fileContents.length}`);

  const userMessage = {
    role: "user",
    content: `Please expand as you did with headlines and bullets on the following topic: ${topic}\nHere are the related file's contents:\n${fileContents}`
  };

  conversationHistory.push(userMessage);

  //const completion = await openai.chat.completions.create({
   // model: "gpt-4o",
    //messages: conversationHistory
  //});

  const assistantMessage = tempAIResponseExpandFactoryPattern; //completion.choices[0].message.content;

  if (!assistantMessage) {
    console.error('Assistant message is null or undefined');
  }

  const assistantResponse = {
    role: "assistant",
    content: assistantMessage
  };

  conversationHistory.push(assistantResponse);

  console.log(`Expanded message: ${assistantMessage}`);
  console.log(`After Expand conversation history: ${JSON.stringify(conversationHistory)}`);

  return assistantMessage;
}

module.exports = {
  RunAI,
  ExpandTopic,
};
