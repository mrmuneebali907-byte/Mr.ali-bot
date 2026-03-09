const axios = require("axios")

const OWNER_NAME = "Mr Muneeb Abbasi"
const OWNER_NUMBER = "923329838699"

async function aiCommand(sock, chatId, message) {

try {

const msg = message.message
const text =
msg?.conversation ||
msg?.extendedTextMessage?.text ||
""

const lower = text.toLowerCase()

/*
--------------------------------
FUNNY BOT REPLY
--------------------------------
*/

if(lower === "bot"){

const funny = [
"Yes? Main chai pee raha tha ☕",
"Bot hoon bhai robot nahi 🤖",
"Main zinda hoon 😎",
"Owner ne mujhe overtime pe rakha hai 😂",
"Bot online hai boss"
]

const reply = funny[Math.floor(Math.random()*funny.length)]

await sock.sendMessage(chatId,{text:reply},{quoted:message})

return
}

/*
--------------------------------
OWNER QUESTION
--------------------------------
*/

if(lower.includes("owner")){

await sock.sendMessage(chatId,{
text:`🤖 Bot Owner: ${OWNER_NAME}\n📞 Number: ${OWNER_NUMBER}`
},{quoted:message})

return
}

/*
--------------------------------
VOICE AI SYSTEM
--------------------------------
*/

if(msg?.audioMessage){

await sock.sendMessage(chatId,{
react:{text:"🎤",key:message.key}
})

const buffer = await sock.downloadMediaMessage(message)

const speech = await axios.post(
"https://api.safone.dev/speech-to-text",
buffer,
{headers:{"Content-Type":"audio/ogg"}}
)

const voiceText = speech.data.text

if(!voiceText){

await sock.sendMessage(chatId,{
text:"Voice samajh nahi aya"
},{quoted:message})

return
}

const ai = await axios.get(
`https://api.safone.dev/chatgpt?text=${encodeURIComponent(voiceText)}`
)

const reply = ai.data.response

const tts =
`https://api.safone.dev/tts?text=${encodeURIComponent(reply)}`

await sock.sendMessage(chatId,{
audio:{url:tts},
mimetype:"audio/mp4",
ptt:true
},{quoted:message})

return
}

/*
--------------------------------
TEXT AI COMMAND
--------------------------------
*/

if(!text.startsWith(".")) return

const args = text.split(" ")
const command = args[0].toLowerCase()
const query = args.slice(1).join(" ")

if(!query){

await sock.sendMessage(chatId,{
text:"Example:\n.gpt what is javascript\n.gemini who made google"
},{quoted:message})

return
}

await sock.sendMessage(chatId,{
react:{text:"🤖",key:message.key}
})

let api = ""

if(command === ".gpt"){

api = `https://api.safone.dev/chatgpt?text=${encodeURIComponent(query)}`

}

else if(command === ".gemini"){

api = `https://api.safone.dev/gemini?text=${encodeURIComponent(query)}`

}

else return

const res = await axios.get(api)

const answer =
res.data.response ||
res.data.answer ||
res.data.result ||
"AI response nahi mila"

await sock.sendMessage(chatId,{
text:answer
},{quoted:message})

}catch(err){

console.log(err)

await sock.sendMessage(chatId,{
text:"AI error try again later"
},{quoted:message})

}

}

module.exports = aiCommand