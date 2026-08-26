import { Resend } from "resend";
import { SendEmailOptions, SendEmailResult } from "./types";

// In-memory store for development/test mode email simulation
export interface SimulatedEmail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from: string;
  sentAt: Date;
}

const simulatedInbox: SimulatedEmail[] = [];

/**
 * Get email client or fallback provider
 */
export async function sendRawEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const defaultFrom = process.env.EMAIL_FROM || "Linkora <onboarding@resend.dev>";
  const defaultReplyTo = process.env.EMAIL_REPLY_TO || undefined;

  const from = options.from || defaultFrom;
  const replyTo = options.replyTo || defaultReplyTo;

  // Development simulation / test mode if no API key or in unit tests
  if (!apiKey || apiKey === "re_your_api_key_here" || process.env.NODE_ENV === "test") {
    const simEmail: SimulatedEmail = {
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from,
      sentAt: new Date(),
    };

    simulatedInbox.push(simEmail);

    if (process.env.EMAIL_DEBUG_MODE === "true" || process.env.NODE_ENV === "development") {
      const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;
      console.log(`\x1b[36m[Email Simulated]\x1b[0m To: ${recipient} | Subject: "${options.subject}" (Test Mode Active)`);
    }

    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      isTestMode: true,
    };
  }

  // Production / Live Resend API Call
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo,
      tags: options.tags,
    });

    if (result.error) {
      console.error("[Resend Error]:", result.error.message);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
      isTestMode: false,
    };
  } catch (error: any) {
    console.error("[Email Dispatch Exception]:", error?.message || error);
    return {
      success: false,
      error: error?.message || "Gagal mengirim email melalui penyedia Resend",
    };
  }
}

/**
 * Testing utilities for integration tests
 */
export function getSimulatedInbox(): SimulatedEmail[] {
  return [...simulatedInbox];
}

export function clearSimulatedInbox(): void {
  simulatedInbox.length = 0;
}
