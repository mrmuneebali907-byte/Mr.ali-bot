/**
 * 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot - Premium Edition
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

const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require("./main")
const store = require("./lib/lightweight_store")

// ================= BASIC SETTINGS =================

global.botname = "𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot"
global.themeemoji = "•"

store.readFromFile()
setInterval(() => store.writeToFile(), 10000)

// ================= BANNER =================

console.clear()
console.log(
    chalk.green(
        figlet.textSync("Mr.MuneebAli Bot", {
            font: "Standard"
        })
    )
)
console.log(chalk.cyan("🚀 Starting Premium WhatsApp Bot...\n"))

// ================= EXPRESS WEB SERVER =================

const app = express()
let latestQR = null

app.get("/", async (req, res) => {
    if (!latestQR) {
        return res.send("<h2>QR not generated yet. Please wait...</h2>")
    }
    const qrImage = await QRCode.toDataURL(latestQR)
    res.send(`
        <h2 style="text-align:center;">Scan QR - Mr.MuneebAli Bot</h2>
        <div style="text-align:center;">
            <img src="${qrImage}" />
        </div>
    `)
})

app.listen(3000, () => {
    console.log(chalk.yellow("🌐 Web QR Server running on http://localhost:3000"))
})

// ================= START BOT =================

async function startBot() {
    try {
        const { version } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState("./session")

        const sock = makeWASocket({
            version,
            logger: pino({ level: "silent" }),
            printQRInTerminal: true,
            browser: ["Mr.MuneebAli Bot", "Chrome", "1.0.0"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
            },
            msgRetryCounterCache: new NodeCache()
        })

        store.bind(sock.ev)
        sock.ev.on("creds.update", saveCreds)

        // ================= CONNECTION =================

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update

            if (qr) {
                latestQR = qr
                console.log(chalk.yellow("📱 QR Generated! Scan from WhatsApp"))
            }

            if (connection === "connecting") {
                console.log(chalk.blue("🔄 Connecting..."))
            }

            if (connection === "open") {
                console.log(chalk.green("✅ Bot Connected Successfully!\n"))

                console.log(chalk.magenta(`${global.themeemoji} OWNER: Mr.MuneebAli`))
                console.log(chalk.magenta(`${global.themeemoji} FACEBOOK: facebook.com/share/1T2ynxXoVd`))
                console.log(chalk.magenta(`${global.themeemoji} WHATSAPP: chat.whatsapp.com/KVn6Rwp8Vps8o4HuZonof5`))
                console.log(chalk.magenta(`${global.themeemoji} TIKTOK: tiktok.com/@its.abbasi.brand1\n`))

                const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net"

                await sock.sendMessage(botNumber, {
                    text: `🤖 ${global.botname} Connected!\n⏰ ${new Date().toLocaleString()}`
                })
            }

            if (connection === "close") {
                const shouldReconnect =
                    lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

                console.log(chalk.red("❌ Connection Closed"))

                if (shouldReconnect) {
                    console.log(chalk.yellow("♻ Reconnecting..."))
                    await delay(5000)
                    startBot()
                } else {
                    fs.rmSync("./session", { recursive: true, force: true })
                    console.log(chalk.red("Session Expired. Scan QR Again."))
                }
            }
        })

        // ================= MESSAGE HANDLER =================

        sock.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0]
                if (!mek.message) return

                if (mek.key.remoteJid === "status@broadcast") {
                    return await handleStatus(sock, chatUpdate)
                }

                await handleMessages(sock, chatUpdate, true)
            } catch (err) {
                console.log("Message Error:", err)
            }
        })

        sock.ev.on("group-participants.update", async (update) => {
            await handleGroupParticipantUpdate(sock, update)
        })

        return sock

    } catch (err) {
        console.log("Fatal Error:", err)
        await delay(5000)
        startBot()
    }
}

startBot()

process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)
