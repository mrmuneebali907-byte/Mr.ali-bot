/**
 * Mr.MuneebAli Bot - Fixed & Working Version
 */

require('./settings')
const fs = require('fs')
const chalk = require('chalk')
const pino = require('pino')
const readline = require('readline')
const NodeCache = require("node-cache")

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

// ===== SETTINGS =====
global.botname = "𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot"
global.themeemoji = "•"

// DO NOT HARD CODE NUMBER HERE
let phoneNumber = process.env.NUMBER || ""

// Pairing flag
const pairingCode = process.argv.includes("--pairing")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCounterCache = new NodeCache()

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        msgRetryCounterCache,
        markOnlineOnConnect: true
    })

    sock.ev.on('creds.update', saveCreds)

    // ===== CONNECTION HANDLER =====
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
            console.log(chalk.green('\n✅ Bot Connected Successfully!\n'))
        }

        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

            console.log(chalk.red('Connection closed. Reconnecting...'))
            if (shouldReconnect) startBot()
        }
    })

    // ===== PAIR CODE SYSTEM =====
    if (pairingCode && !sock.authState?.creds?.registered) {
        if (!phoneNumber) {
            phoneNumber = await question('📱 Enter Your WhatsApp Number with country code (e.g 923329838699):\n')
        }

        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber.trim())
            console.log(chalk.yellow(`\n🔑 Your Pairing Code: ${code}\n`))
        }, 3000)
    }

    return sock
}

startBot()
