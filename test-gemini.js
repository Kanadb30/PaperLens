const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.*)/);
let rawKey = match ? match[1].trim() : '';
if (rawKey.endsWith(',')) rawKey = rawKey.slice(0, -1);
if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
if (rawKey.startsWith("'") && rawKey.endsWith("'")) rawKey = rawKey.slice(1, -1);

const genAI = new GoogleGenerativeAI(rawKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function run() {
  try {
    const base64 = fs.readFileSync('attention.pdf', 'base64');
    console.log('Starting generateELI5');
    const prompt = 'return ONLY a JSON array of { "section": "string", "simpleExplanation": "string", "analogy": "string" }';
    const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: 'application/pdf' } }]);
    console.log('Result length:', result.response.text().length);
    console.log(result.response.text());
  } catch (e) {
    console.error('FAILED:', e.message);
  }
}
run();
