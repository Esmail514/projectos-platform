import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegramAlert, sendDiscordAlert } from "@/lib/notifier";
import { getCurrentUser, hasPermission } from "@/lib/auth";

// GET current alert settings
export async function GET() {
  try {
    let config = await prisma.alertConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.alertConfig.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST update settings or test alert (requires manage_alerts permission)
export async function POST(req: NextRequest) {
  try {
    const { user } = await getCurrentUser(req);
    const usersCount = await prisma.user.count();

    if (usersCount > 0) {
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Authentication required to manage alerts" },
          { status: 401 }
        );
      }
      if (!hasPermission(user, "manage_alerts")) {
        return NextResponse.json(
          { success: false, error: "Access Denied: manage_alerts permission required" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { action, telegramBotToken, telegramChatId, discordWebhook, isTelegramEnabled, isDiscordEnabled, cpuThreshold } = body;

    if (action === "TEST_ALERT") {
      let telegramSuccess = false;
      let discordSuccess = false;

      if (isTelegramEnabled && telegramBotToken && telegramChatId) {
        telegramSuccess = await sendTelegramAlert("اختبار تنبيه تجريبي: نظام الرقابة 360° متصل وجاهز للعمل بنجاح! 🚀");
      }

      if (isDiscordEnabled && discordWebhook) {
        discordSuccess = await sendDiscordAlert(
          "ProjectOS Monitoring Test",
          "Test Alert: 360° Observability engine is fully connected and operational! 🚀",
          "info"
        );
      }

      return NextResponse.json({
        success: true,
        telegram: telegramSuccess,
        discord: discordSuccess,
      });
    }

    // Save configuration
    const updated = await prisma.alertConfig.upsert({
      where: { id: "default" },
      update: {
        telegramBotToken: telegramBotToken || null,
        telegramChatId: telegramChatId || null,
        discordWebhook: discordWebhook || null,
        isTelegramEnabled: !!isTelegramEnabled,
        isDiscordEnabled: !!isDiscordEnabled,
        cpuThreshold: cpuThreshold || 85,
      },
      create: {
        id: "default",
        telegramBotToken: telegramBotToken || null,
        telegramChatId: telegramChatId || null,
        discordWebhook: discordWebhook || null,
        isTelegramEnabled: !!isTelegramEnabled,
        isDiscordEnabled: !!isDiscordEnabled,
        cpuThreshold: cpuThreshold || 85,
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
