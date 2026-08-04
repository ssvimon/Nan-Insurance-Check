# Nan Insurance Check

แบบประเมินความคุ้มครองประกันเบื้องต้น พร้อมส่งผลไป Discord

## Development

```bash
npm install
npm run dev
```

## Environment

คัดลอกตัวอย่างแล้วใส่ค่าจริงใน `.env.local` (อย่า commit ไฟล์นี้)

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

บน Vercel ตั้ง Environment Variable ชื่อเดียวกันใน Project Settings

## Deploy

- GitHub: `https://github.com/ssvimon/Nan-Insurance-Check`
- Vercel: เชื่อม repo นี้ แล้วตั้ง `DISCORD_WEBHOOK_URL`
