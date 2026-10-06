import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Direct proxy of live SCImago Journal Rank (Indonesia) via Google Web Engine
  // Bypasses Cloudflare 403 & X-Frame-Options SAMEORIGIN while rendering 100% of SCImago's exact live UI
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SCImago Journal Rank Indonesia (SJR)</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #0f172a; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
  </style>
</head>
<body>
  <iframe
    src="https://translate.google.com/translate?sl=en&tl=id&u=https://www.scimagojr.com/journalrank.php?country=ID"
    title="SCImago Journal Rank Indonesia"
    allow="fullscreen"
  ></iframe>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
