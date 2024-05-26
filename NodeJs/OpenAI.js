const OpenAI = require("openai");
const dotenvPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
    const completion = await openai.chat.completions.create({
      messages: [{"role": "system", "content": "You are a code architect."},
          {"role": "user", "content": "Im going to give you an OOP structure and you will provide suggestion for improvment."},
          {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
          {"role": "user", "content": "Where was it played?"}],
      model: "gpt-3.5-turbo",
    });
  
    console.log(completion.choices[0]);
  }
  main();