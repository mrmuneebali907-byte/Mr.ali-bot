const os = require('os');
const fs = require('fs');
const path = require('path');
const settings = require('../settings.js');

function formatTime(seconds) {
    const d = Math.floor(seconds / (24 * 3600));
    seconds %= (24 * 3600);
    const h = Math.floor(seconds / 3600);
    seconds %= 3600;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    let t = '';
    if (d) t += d + 'd ';
    if (h) t += h + 'h ';
    if (m) t += m + 'm ';
    if (s || !t) t += s + 's';
    return t.trim();
}

async function pingCommand(sock, chatId, message) {
    try {

        const start = Date.now();

        const ping = Date.now() - start;

        const uptime = formatTime(process.uptime());

        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const platform = os.platform();

        let speedBar = "▰▰▰▰▰▰▰▰▰▰";

        if (ping > 300) speedBar = "▰▰▰▰▰▰▰▱▱▱";
        if (ping > 500) speedBar = "▰▰▰▰▰▱▱▱▱▱";

        const caption = `
🏓 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 𝐁𝐨𝐭 𝐀𝐜𝐭𝐢𝐯𝐞 𝐡𝐚𝐢! 🤖✨

┏━━〔 🤖 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 𝑩𝒐𝒕 〕━━┓
┃ ⚡ Ping      : ${ping} ms
┃ 📊 Speed    : ${speedBar}
┃ ⏱ Uptime    : ${uptime}
┃ 💾 RAM      : ${ram} MB
┃ 🖥 Platform : ${platform}
┃ 🔖 Version  : v${settings.version}
┗━━━━━━━━━━━━━━━━━━━┛
`.trim();

        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

        const imageBuffer = fs.readFileSync(imagePath);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: caption
        }, { quoted: message });

    } catch (err) {

        console.log(err);

        await sock.sendMessage(chatId, {
            text: "❌ Ping check failed"
        });

    }
}

module.exports = pingCommand;
