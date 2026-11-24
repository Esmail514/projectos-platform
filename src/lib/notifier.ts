import { prisma } from "./db";

export async function sendTelegramAlert(message: string): Promise<boolean> {
  try {
    const config = await prisma.alertConfig.findUnique({
      where: { id: "default" },
    });

    if (!config?.telegramBotToken || !config?.telegramChatId || !config.isTelegramEnabled) {
      return false;
    }

    const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text: `🚨 [ProjectOS 360° Alert]\n\n${message}`,
        parse_mode: "Markdown",
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to dispatch Telegram alert:", err);
    return false;
  }
}

export async function sendDiscordAlert(title: string, description: string, level: "info" | "warn" | "error" = "info"): Promise<boolean> {
  try {
    const config = await prisma.alertConfig.findUnique({
      where: { id: "default" },
    });

    if (!config?.discordWebhook || !config.isDiscordEnabled) {
      return false;
    }

    const colors = {
      info: 3447003,  // Blue
      warn: 16776960, // Yellow
      error: 15158332 // Red
    };

    const res = await fetch(config.discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: `🛡️ ${title}`,
            description,
            color: colors[level],
            timestamp: new Date().toISOString(),
            footer: { text: "ProjectOS Observability Engine" }
          }
        ]
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to dispatch Discord alert:", err);
    return false;
  }
}
