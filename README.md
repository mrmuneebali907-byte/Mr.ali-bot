# 🤖 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot

This is a WhatsApp bot built using the Baileys library for advanced group management, including tagging members, muting/unmuting, games, stickers, and much more. Designed to help admins efficiently manage WhatsApp groups with powerful automation.
---

### 2️⃣ Auto‑Generate VIP Bot Image (`bot_image.jpg`) Code

```javascript
// generate_vip_image.js
// VIP Image Generator for 𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊 Bot
// Overwrites ./assets/bot_image.jpg

const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

// Output file
const filePath = "./assets/bot_image.jpg";

// Canvas size
const width = 800;
const height = 600;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Background gradient (VIP gold/black)
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, "#FFD700"); // Gold
gradient.addColorStop(1, "#000000"); // Black
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Load existing bot image if exists
const existingImagePath = "./assets/bot_image.jpg";
if (fs.existsSync(existingImagePath)) {
  loadImage(existingImagePath).then((image) => {
    ctx.drawImage(image, 150, 100, 500, 400); // center resized
    drawText();
  });
} else {
  drawText();
}

// Draw VIP style text
function drawText() {
  ctx.font = "bold 60px 'Orbitron', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("𝑴𝒓.𝑴𝒖𝒏𝒆𝒆𝒃𝑨𝒍𝒊", width / 2, 80);

  // Optional: circular DP style
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(width / 2, 300, 100, 0, Math.PI * 2);
  ctx.stroke();

  // Save
  const buffer = canvas.toBuffer("image/jpeg");
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ VIP image generated & saved: ${filePath}`);
}
