type SubmitPayload = {
  name?: string;
  age?: string;
  income?: string;
  status?: string;
  benefit?: string;
  phone?: string;
  lineId?: string;
  note?: string;
  budget?: string;
  priorities?: string[];
};

function truncate(value: string, max = 1024) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function escapeMd(value: string) {
  return value.replace(/([\\_*`~>|])/g, "\\$1");
}

export async function POST(request: Request) {
  const webhook = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhook) {
    return Response.json({ error: "Discord webhook is not configured" }, { status: 500 });
  }

  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const age = body.age?.trim() ?? "";
  const income = body.income?.trim() ?? "";
  const status = body.status?.trim() ?? "";
  const benefit = body.benefit?.trim() ?? "";
  const phone = (body.phone ?? "").replace(/\D/g, "");
  const lineId = body.lineId?.trim() ?? "";
  const note = body.note?.trim() ?? "";
  const budget = body.budget?.trim() ?? "";
  const priorities = Array.isArray(body.priorities)
    ? body.priorities.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
    : [];

  if (!name || !age || !income || !status || !benefit || !budget || priorities.length !== 3) {
    return Response.json({ error: "Incomplete assessment data" }, { status: 400 });
  }
  if (!phone && !lineId) {
    return Response.json({ error: "Phone or LINE ID is required" }, { status: 400 });
  }

  const safeName = escapeMd(name);
  const priorityLines = priorities
    .map((item, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
      return `${medal} **อันดับ ${index + 1}**\n${escapeMd(item)}`;
    })
    .join("\n\n");

  const now = new Date();
  const thaiTime = now.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const contactLines = [
    phone ? `**เบอร์โทร:** ${escapeMd(phone)}` : null,
    lineId ? `**LINE ID:** ${escapeMd(lineId)}` : null,
  ].filter(Boolean) as string[];

  const embed = {
    author: {
      name: "คุยเรื่องประกันกับแนน · แบบประเมินใหม่",
      icon_url: "https://cdn.discordapp.com/embed/avatars/1.png",
    },
    title: `📋 สรุปแบบประเมินของ ${safeName}`,
    description: [
      `> มีผู้สนใจทำแบบประเมินความคุ้มครองเรียบร้อยแล้ว`,
      `> เวลาที่ส่ง: **${thaiTime}**`,
      ``,
      `ใช้ข้อมูลด้านล่างเพื่อติดต่อกลับหรือเตรียมคำแนะนำต่อได้เลย`,
    ].join("\n"),
    color: 0xe11d48,
    fields: [
      {
        name: "👤 ข้อมูลพื้นฐาน",
        value: [
          `**ชื่อเล่น:** ${escapeMd(name)}`,
          `**อายุ:** ${escapeMd(age)} ปี`,
          `**สถานภาพ:** ${escapeMd(status)}`,
        ].join("\n"),
        inline: true,
      },
      {
        name: "💼 การเงิน & สวัสดิการ",
        value: [
          `**รายได้/เดือน:** ${escapeMd(income)}`,
          `**สวัสดิการ:** ${escapeMd(benefit)}`,
          `**งบที่สบายใจ:** ${escapeMd(budget)}`,
        ].join("\n"),
        inline: true,
      },
      {
        name: "📞 ช่องทางติดต่อกลับ",
        value: truncate(contactLines.join("\n") || "-"),
        inline: false,
      },
      ...(note
        ? [{
            name: "📝 หมายเหตุจากลูกค้า",
            value: truncate(escapeMd(note)),
            inline: false,
          }]
        : []),
      {
        name: "🎯 ลำดับความสำคัญ 3 เรื่อง",
        value: truncate(priorityLines),
        inline: false,
      },
    ],
    footer: {
      text: `Nan Insurance Check • ส่งอัตโนมัติจากเว็บไซต์`,
      icon_url: "https://cdn.discordapp.com/embed/avatars/2.png",
    },
    timestamp: now.toISOString(),
  };

  try {
    const discordRes = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Nan Insurance Bot",
        avatar_url: "https://cdn.discordapp.com/embed/avatars/4.png",
        embeds: [embed],
      }),
    });

    if (!discordRes.ok) {
      const detail = await discordRes.text().catch(() => "");
      return Response.json(
        { error: "Failed to send Discord notification", detail: detail.slice(0, 200) },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
