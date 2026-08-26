export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isTestMode?: boolean;
}

export interface BaseTemplateProps {
  previewText?: string;
  appUrl?: string;
  currentYear?: number;
}

export interface PasswordResetTemplateProps extends BaseTemplateProps {
  userName?: string | null;
  resetUrl: string;
  expiryMinutes: number;
}

export interface WelcomeTemplateProps extends BaseTemplateProps {
  userName?: string | null;
  isGoogleAuth?: boolean;
  loginUrl?: string;
}

export interface VerificationOtpTemplateProps extends BaseTemplateProps {
  userName?: string | null;
  otp: string;
  expiryMinutes: number;
}

export type EmailEventType =
  | "otp_sent"
  | "otp_verified"
  | "otp_failed"
  | "password_reset_requested"
  | "password_reset_completed"
  | "welcome_email_sent"
  | "email_send_failed";
