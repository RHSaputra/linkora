import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Return clean client-side HTML wrapper to allow user's browser to fetch SCImago directly, bypassing Cloudflare bot checks
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SCImago Journal Rank Indonesia</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #0f172a; }
    iframe { width: 100%; height: 100%; border: 0; display: block; }
  </style>
</head>
<body>
  <iframe
    src="https://www.scimagojr.com/journalrank.php?country=ID"
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
