import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("google-site-verification: google11b6dbcd923e8c04.html", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
