const axios = require("axios");
const gTTS = require("gtts");
const fs = require("fs");

async function aiCommand(sock, chatId, message) {

try {

const text =
message.message?.conversation ||
message.message?.extendedTextMessage?.text ||
message.message?.imageMessage?.caption ||
message.message?.videoMessage?.caption;

const voice = message.message?.audioMessage;

let query = text;

/* BOT CALL */

if (text && text.toLowerCase() === "bot") {

await sock.sendMessage(chatId,{
text:
"👋 Assalam o Alaikum!\n\nMain 𝙈𝙧.𝙈𝙪𝙣𝙚𝙚𝙗 𝘼𝙡𝙞 𝘽𝙤𝙩 hoon 🤖\n\nMain aapki help ke liye active hoon.\nAap mujhse kuch bhi pooch sakte hain.\n\nExample:\n.gpt Pakistan kya hai\n.gemini HTML code likho\n\n👑 Owner: Mr.MuneebAli ✍️💞"
},{quoted:message});

return;

}

/* VOICE MESSAGE */

if (voice) {

await sock.sendMessage(chatId,{
text:"🎤 Voice message mila.\nAbhi voice AI developing mode mein hai.\nFilhal text command use karein."
},{quoted:message});

return;

}

/* COMMAND CHECK */

if (!text) return;

const args = text.split(" ");
const command = args[0].toLowerCase();

if (command !== ".gpt" && command !== ".gemini") return;

query = args.slice(1).join(" ");

if (!query) {

await sock.sendMessage(chatId,{
text:"❗ Sawal likho.\nExample:\n.gpt HTML ka code likho"
},{quoted:message});

return;

}

/* REACTION */

await sock.sendMessage(chatId,{
react:{text:"🤖",key:message.key}
});

/* AI PROMPT */

const prompt = `
Tum ek intelligent WhatsApp AI ho.

Bot Name: 𝙈𝙧.𝙈𝙪𝙣𝙚𝙚𝙗 𝘼𝙡𝙞 𝘽𝙤𝙩

Owner: Mr.MuneebAli

Rules:

- Har sawal ka clear jawab do
- Friendly aur funny tone rakho
- Agar koi udaas ho to usko motivate karo
- Agar koi owner ke bare me puche to bolo:
  "Mera owner Mr.MuneebAli ✍️💞 hai"

User question:
${query}
`;

const apis = [

"https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(prompt)}",

"https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(prompt)}",

"https://vapis.my.id/api/gemini?q=${encodeURIComponent(prompt)}"

];

let answer = null;

for (let api of apis) {

try {

const response = await axios.get(api,{timeout:15000});

const data = response.data;

answer =
data.answer ||
data.result ||
data.message ||
data.data;

if (answer) break;

} catch(e) {

continue;

}

}

if (!answer) {

answer = "❌ AI response nahi mila. Thodi der baad try karo.";

}

/* TEXT REPLY */

await sock.sendMessage(chatId,{
text:answer
},{quoted:message});

/* VOICE REPLY */

try {

const file = "./ai_voice.mp3";

const tts = new gTTS(answer,"en");

await new Promise((resolve)=>{
tts.save(file,resolve);
});

await sock.sendMessage(chatId,{
audio:fs.readFileSync(file),
mimetype:"audio/mp4",
ptt:true
},{quoted:message});

fs.unlinkSync(file);

}catch(e){

console.log("Voice error",e);

}

}catch(err){

console.log("AI ERROR:",err);

await sock.sendMessage(chatId,{
text:"❌ Error aa gaya. Baad mein try karein."
},{quoted:message});

}

}

module.exports = aiCommand;
