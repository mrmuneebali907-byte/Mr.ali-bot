/**
 * 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot - Ultra Premium Final
 */

require('./settings')

const fs = require("fs")
const chalk = require("chalk")
const figlet = require("figlet")
const express = require("express")
const QRCode = require("qrcode")
const pino = require("pino")
const NodeCache = require("node-cache")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
makeCacheableSignalKeyStore,
delay
} = require("@whiskeysockets/baileys")

// ================= BASIC =================

global.botname = "𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot"

console.clear()
console.log(
chalk.green(
figlet.textSync("Mr.MuneebAli Bot", { font: "Standard" })
)
)

console.log(chalk.cyan("🚀 Starting WhatsApp Bot...\n"))

// ================= EXPRESS SERVER =================

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use(express.static("panel"))

let latestQR = null
let activeSock = null

// LOGIN PAGE
app.get("/",(req,res)=>{
res.sendFile(__dirname + "/panel/login.html")
})

// DASHBOARD
app.get("/dashboard",(req,res)=>{
res.sendFile(__dirname + "/panel/dashboard.html")
})

// QR API
app.get("/qr", async (req,res)=>{

if(!latestQR) return res.json({})

const qr = await QRCode.toDataURL(latestQR)

res.json({qr})

})

// PAIR CODE API
app.post("/pair", async (req,res)=>{

try{

let number = req.body.number

if(!number){
return res.json({code:"ENTER NUMBER"})
}

if(!activeSock){
return res.json({code:"BOT NOT READY"})
}

const code = await activeSock.requestPairingCode(number.trim())

res.json({code})

}catch(err){

console.log(err)
res.json({code:"PAIR FAILED"})

}

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(chalk.yellow(`🌐 Server Running on Port ${PORT}\n`))
})

// ================= START BOT =================

async function startBot(){

try{

const { version } = await fetchLatestBaileysVersion()

const { state, saveCreds } =
await useMultiFileAuthState("./session")

const sock = makeWASocket({

version,

logger:pino({level:"silent"}),

printQRInTerminal:true,

browser:["Mr.MuneebAli Bot","Chrome","1.0.0"],

auth:{
creds:state.creds,
keys:makeCacheableSignalKeyStore(
state.keys,
pino({level:"fatal"})
)
},

msgRetryCounterCache:new NodeCache()

})

activeSock = sock

sock.ev.on("creds.update",saveCreds)

sock.ev.on("connection.update", async(update)=>{

const {connection,lastDisconnect,qr} = update

if(qr){

latestQR = qr
console.log(chalk.yellow("📱 QR Generated"))

}

if(connection==="open"){

console.log(chalk.green("✅ Bot Connected Successfully!\n"))

}

if(connection==="close"){

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

console.log(chalk.red("❌ Connection Closed"))

if(shouldReconnect){

console.log(chalk.yellow("♻ Reconnecting..."))
await delay(5000)
startBot()

}else{

fs.rmSync("./session",{recursive:true,force:true})

console.log(chalk.red("Session Expired. Scan Again."))

}

}

})

}catch(err){

console.log("Fatal Error:",err)
await delay(5000)
startBot()

}

}

startBot()

process.on("uncaughtException",console.error)
process.on("unhandledRejection",console.error)
