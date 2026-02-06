const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Scan this QR Code:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot();
      } else {
        console.log("Logged out!");
      }
    }

    if (connection === "open") {
      console.log("Bot Connected Successfully!");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const command = text.toLowerCase();

    if (command === ".ping") {
      await sock.sendMessage(from, { text: "Pong ✅" });
    }

    if (command === ".alive") {
      await sock.sendMessage(from, { text: "Bot is Alive ✅🔥" });
    }

    if (command === ".menu" || command === ".help") {
      await sock.sendMessage(from, {
        text: `🤖 Mr Ali Bot Menu

✅ General Commands:
.ping
.alive
.menu / .help

👥 Group Commands:
.groupinfo

(Admin only later)
`
      });
    }

    if (command === ".groupinfo") {
      if (!isGroup) {
        return sock.sendMessage(from, { text: "❌ Ye command sirf group me chalegi." });
      }

      await sock.sendMessage(from, { text: `Group ID: ${from}` });
    }
  });
}

startBot();
