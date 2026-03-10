const settings = require("../settings");
const fs = require("fs");
const os = require("os");

async function aliveCommand(sock, chatId, message) {
    try {

        const start = new Date().getTime()

        const used = process.memoryUsage().heapUsed / 1024 / 1024
        const total = os.totalmem() / 1024 / 1024
        const uptime = process.uptime()

        const hours = Math.floor(uptime / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)

        const end = new Date().getTime()
        const speed = end - start

        const caption = `
╭━━〔 🤖 *𝘼𝙇𝙄 𝘽𝙊𝙏* 🤖 〕━━⬣

┃ 👑 *Owner:* Mr Muneeb Ali
┃ 📦 *Version:* ${settings.version}
┃ 🌐 *Mode:* Public
┃ ⚡ *Speed:* ${speed} ms
┃ ⏱ *Uptime:* ${hours}h ${minutes}m ${seconds}s
┃ 💾 *RAM:* ${used.toFixed(2)} MB / ${total.toFixed(0)} MB

╰━━━━━━━━━━━━⬣

🌟 *FEATURES*

➤ GROUP MANAGEMENT 👥
➤ ANTILINK PROTECTION 🚫
➤ FUN COMMANDS 🎮
➤ DOWNLOAD COMMANDS 📥
➤ AND MORE 🔥

📜 *Type:* .menu

💎 *Powered By:* 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊✍️💞
`;

        await sock.sendMessage(chatId, {
            image: fs.readFileSync("./assets/bot_image.jpg"),
            caption: caption
        }, { quoted: message });

    } catch (error) {
        console.log("Alive command error:", error);
    }
}

module.exports = aliveCommand;
