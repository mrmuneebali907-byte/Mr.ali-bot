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

let latestQR = null
let activeSock = null

// QR PAGE
app.get("/", async (req, res) => {
    if (!latestQR) {
        return res.send("<h2>QR Not Generated Yet...</h2>")
    }
    const qrImage = await QRCode.toDataURL(latestQR)
    res.send(`
        <h2 style="text-align:center;">Scan QR - Mr.MuneebAli Bot</h2>
        <div style="text-align:center;">
            <img src="${qrImage}" />
        </div>
        <hr/>
        <h3 style="text-align:center;">Pair Code Method</h3>
        <form method="POST" action="/pair">
            <input name="number" placeholder="923XXXXXXXXX" required/>
            <button type="submit">Generate Code</button>
        </form>
    `)
})

// PAIR ROUTE
app.post("/pair", async (req, res) => {
    try {
        const number = req.body.number

        if (!number) {
            return res.send("Enter Number with Country Code")
        }

        if (!activeSock) {
            return res.send("Bot Not Ready Yet")
        }

        const code = await activeSock.requestPairingCode(number)
        res.send(`<h2>Your Pair Code:</h2><h1>${code}</h1>`)

    } catch (err) {
        console.log(err)
        res.send("Pairing Failed")
    }
})

app.listen(3000, () => {
    console.log(chalk.yellow("🌐 Server Running on http://localhost:3000\n"))
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

        activeSock = sock
        sock.ev.on("creds.update", saveCreds)

        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update

            if (qr) {
                latestQR = qr
                console.log(chalk.yellow("📱 QR Generated"))
            }

            if (connection === "open") {
                console.log(chalk.green("✅ Bot Connected Successfully!\n"))
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
                    console.log(chalk.red("Session Expired. Scan Again."))
                }
            }
        })

    } catch (err) {
        console.log("Fatal Error:", err)
        await delay(5000)
        startBot()
    }
}

startBot()

process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)
