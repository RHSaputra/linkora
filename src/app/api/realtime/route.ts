import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const safeEnqueue = (data: string) => {
          if (isClosed || request.signal.aborted) return;
          try {
            controller.enqueue(encoder.encode(data));
          } catch {
            isClosed = true;
          }
        };

        // Send initial connection confirmation
        safeEnqueue("event: connected\ndata: {}\n\n");

        // Store IDs of reminders we've already notified the client about in this session
        const notifiedKeys = new Set<string>();

        const sendReminders = async () => {
          if (isClosed || request.signal.aborted) return;
          try {
            const now = new Date();
            // Fetch links with active reminders in the past
            const dueLinks = await prisma.link.findMany({
              where: {
                userId,
                reminderAt: { lte: now },
              },
              select: { id: true, title: true, url: true, reminderAt: true },
            });

            // Fetch notes with active reminders in the past
            const dueNotes = await prisma.note.findMany({
              where: {
                userId,
                reminderAt: { lte: now },
              },
              select: { id: true, title: true, reminderAt: true },
            });

            const notifications: any[] = [];

            dueLinks.forEach((link) => {
              const key = `link-${link.id}-${link.reminderAt?.getTime()}`;
              if (!notifiedKeys.has(key)) {
                notifiedKeys.add(key);
                notifications.push({
                  id: key,
                  type: "link",
                  targetId: link.id,
                  title: `Pengingat Tautan`,
                  description: `Saatnya meninjau tautan: "${link.title}"`,
                  url: link.url,
                });
              }
            });

            dueNotes.forEach((note) => {
              const key = `note-${note.id}-${note.reminderAt?.getTime()}`;
              if (!notifiedKeys.has(key)) {
                notifiedKeys.add(key);
                notifications.push({
                  id: key,
                  type: "note",
                  targetId: note.id,
                  title: `Pengingat Catatan`,
                  description: `Saatnya meninjau catatan: "${note.title}"`,
                  url: `/notes/${note.id}`,
                });
              }
            });

            if (notifications.length > 0) {
              safeEnqueue(
                `event: reminders\ndata: ${JSON.stringify(notifications)}\n\n`
              );
            }

            // Send standard comment ping/heartbeat to keep connection alive
            safeEnqueue(": ping\n\n");
          } catch (err) {
            console.error("Error in SSE reminder check:", err);
          }
        };

        // Run immediately
        await sendReminders();

        // Check reminders and send heartbeat every 15 seconds to prevent browser/proxy connection timeouts
        const intervalId = setInterval(sendReminders, 15000);

        // Cleanup on abort
        request.signal.addEventListener("abort", () => {
          isClosed = true;
          clearInterval(intervalId);
          try {
            controller.close();
          } catch {}
        });
      },
      cancel() {
        // Stream cancelled
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform, no-store",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("GET /api/realtime error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
