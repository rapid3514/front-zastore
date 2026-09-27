require("dotenv").config();

const { spawn } = require("child_process");

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = 3001;
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN topilmadi");
  process.exit(1);
}

const cloudflared = spawn(
  "cloudflared",
  ["tunnel", "--url", `http://localhost:${PORT}`],
  {
    shell: true,
  }
);

let webhookSet = false;

cloudflared.stderr.on("data", async (data) => {
  const text = data.toString();

  process.stdout.write(text);

  const match = text.match(
    /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/
  );

  if (match && !webhookSet) {
    webhookSet = true;

    const tunnelUrl = match[0];

    const webhookUrl =
      `${tunnelUrl}/api/v1/telegram/webhook`;

    console.log("\nCloudflare URL:");
    console.log(tunnelUrl);

    console.log("\nWebhook yangilanmoqda...");
    console.log(webhookUrl);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: webhookUrl,
          }),
        }
      );

      const result = await response.json();

      console.log("\nTelegram javobi:");
      console.log(result);

      if (result.ok) {
        console.log("\n✅ Webhook avtomatik yangilandi");
      } else {
        console.log("\n❌ Webhook yangilanmadi");
      }
    } catch (error) {
      console.error("Webhook xatosi:", error);
    }
  }
});

cloudflared.on("close", (code) => {
  console.log(`Cloudflare tunnel yopildi: ${code}`);
});