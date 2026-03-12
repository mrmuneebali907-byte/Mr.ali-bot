const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

const USER_GROUP_DATA = path.join(__dirname,'../data/userGroupData.json')

const chatMemory={
messages:new Map(),
userInfo:new Map()
}

function loadUserGroupData(){
try{
return JSON.parse(fs.readFileSync(USER_GROUP_DATA,'utf8'))
}catch(e){
console.log('Load error',e.message)
return {groups:[],chatbot:{}}
}
}

function saveUserGroupData(data){
try{
fs.writeFileSync(USER_GROUP_DATA,JSON.stringify(data,null,2))
}catch(e){
console.log('Save error',e.message)
}
}

function delay(){
return Math.floor(Math.random()*3000)+2000
}

async function typing(sock,chatId){
try{
await sock.presenceSubscribe(chatId)
await sock.sendPresenceUpdate('composing',chatId)
await new Promise(r=>setTimeout(r,delay()))
}catch{}
}

function extractUserInfo(msg){
const info={}
const lower=msg.toLowerCase()

if(lower.includes("my name is")){
info.name=msg.split("my name is")[1].trim().split(" ")[0]
}

if(lower.includes("years old")){
info.age=msg.match(/\d+/)?.[0]
}

if(lower.includes("i live in")||lower.includes("i am from")){
info.location=msg.split(/(?:i live in|i am from)/i)[1].trim().split(/[.,!?]/)[0]
}

return info
}

async function handleChatbotCommand(sock,chatId,message,match){

if(!match){
await typing(sock,chatId)
return sock.sendMessage(chatId,{
text:`*CHATBOT SETUP*

.chatbot on
Enable chatbot

.chatbot off
Disable chatbot`,
quoted:message
})
}

const data=loadUserGroupData()

const botNumber=sock.user.id.split(':')[0]+'@s.whatsapp.net'
const senderId=message.key.participant||message.key.remoteJid
const isOwner=senderId===botNumber

let isAdmin=false

if(chatId.endsWith('@g.us')){
try{
const meta=await sock.groupMetadata(chatId)
isAdmin=meta.participants.some(p=>p.id===senderId&&(p.admin==="admin"||p.admin==="superadmin"))
}catch{}
}

if(!isAdmin&&!isOwner){
return sock.sendMessage(chatId,{text:"❌ Only admin or bot owner can use this command.",quoted:message})
}

if(match==="on"){
data.chatbot[chatId]=true
saveUserGroupData(data)
return sock.sendMessage(chatId,{text:"✅ Chatbot enabled",quoted:message})
}

if(match==="off"){
delete data.chatbot[chatId]
saveUserGroupData(data)
return sock.sendMessage(chatId,{text:"❌ Chatbot disabled",quoted:message})
}

}

async function handleChatbotResponse(sock,chatId,message,userMessage,senderId){

const data=loadUserGroupData()
if(!data.chatbot[chatId]) return

try{

const botId=sock.user.id
const botNumber=botId.split(':')[0]

let mentioned=false
let reply=false

if(message.message?.extendedTextMessage){

const mentionList=message.message.extendedTextMessage.contextInfo?.mentionedJid||[]
const quoted=message.message.extendedTextMessage.contextInfo?.participant

mentioned=mentionList.some(j=>j.includes(botNumber))

if(quoted){
const cleanQuoted=quoted.replace(/[:@].*/,'')
if(cleanQuoted===botNumber) reply=true
}

}

if(!mentioned&&!reply)return

let clean=userMessage.replace(new RegExp(`@${botNumber}`,'g'),'').trim()

if(!chatMemory.messages.has(senderId)){
chatMemory.messages.set(senderId,[])
chatMemory.userInfo.set(senderId,{})
}

const info=extractUserInfo(clean)

if(Object.keys(info).length>0){
chatMemory.userInfo.set(senderId,{
...chatMemory.userInfo.get(senderId),
...info
})
}

const msgs=chatMemory.messages.get(senderId)

msgs.push(clean)

if(msgs.length>20)msgs.shift()

chatMemory.messages.set(senderId,msgs)

await typing(sock,chatId)

const ai=await getAIResponse(clean,{
messages:chatMemory.messages.get(senderId),
userInfo:chatMemory.userInfo.get(senderId)
})

if(!ai){
return sock.sendMessage(chatId,{text:"🤔 Network slow hai phir se bolo",quoted:message})
}

await sock.sendMessage(chatId,{text:ai},{quoted:message})

}catch(e){
console.log("Chatbot error",e)
}

}

async function getAIResponse(userMessage,userContext){

try{

const prompt=`

You are chatting like a real human on WhatsApp.

Never say you are AI.

LANGUAGE RULE
Reply in SAME language user used.

STYLE
Short replies
Natural human tone
WhatsApp casual chat

Name: Knight Bot

Previous messages:
${userContext.messages.join('\n')}

User info:
${JSON.stringify(userContext.userInfo)}

User message:
${userMessage}

Reply:

`.trim()

const res=await fetch("https://zellapi.autos/ai/chatbot?text="+encodeURIComponent(prompt))

if(!res.ok) throw new Error("API fail")

const data=await res.json()

if(!data.status||!data.result) throw new Error("Invalid API")

let reply=data.result.trim()

reply=reply
.replace(/winks/g,'😉')
.replace(/eye roll/g,'🙄')
.replace(/shrug/g,'🤷‍♂️')
.replace(/raises eyebrow/g,'🤨')
.replace(/smiles/g,'😊')
.replace(/laughs/g,'😂')
.replace(/cries/g,'😢')
.replace(/thinks/g,'🤔')
.replace(/sleeps/g,'😴')

.replace(/IMPORTANT:.*$/g,'')
.replace(/RULES:.*$/g,'')
.replace(/STYLE:.*$/g,'')
.replace(/Reply:.*$/g,'')

return reply.trim()

}catch(e){
console.log("AI error",e)
return "😅 samajh nahi aya phir se bolo"
}

}

module.exports={
handleChatbotCommand,
handleChatbotResponse
}