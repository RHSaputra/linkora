"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Database, Link2, Loader2, CheckCircle, FileText, BookOpen } from "lucide-react";
import { invalidateCache, dispatchRefresh } from "@/hooks/use-data";
import { toast } from "@/components/ui/custom-toast";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useTranslation } from "@/components/providers/i18n-provider";

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

type QuickCaptureState = "idle" | "saving" | "saved" | "error";

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  /** URL detected in this message, available for quick capture */
  detectedUrl?: string;
  /** State for quick capture card in chat */
  captureState?: QuickCaptureState;
  /** Result info after successful capture */
  captureResult?: { title: string; category: string };
};

export function LinkoraAIChat() {
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      role: "ai", 
      content: locale === "en"
        ? "Hi Linkorian! I'm Liko, your personal Linkora assistant. Ask me anything about your saved links, notes, or categories!"
        : "Hai Linkorian! Aku Liko, asisten Linkora-mu. Aku siap membantumu mengelola tautan, catatan, dan berbagai hal lain. Tanya apa saja seputar tautan, kategori, atau hal lain yang bisa kubantu ya!" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [savedNoteMsgIds, setSavedNoteMsgIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Dynamically update the initial greeting when the user switches locale
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === "1") {
          return {
            ...m,
            content:
              locale === "en"
                ? "Hi Linkorian! I'm Liko, your personal Linkora assistant. Ask me anything about your saved links, notes, or categories!"
                : "Hai Linkorian! Aku Liko, asisten Linkora-mu. Aku siap membantumu mengelola tautan, catatan, dan berbagai hal lain. Tanya apa saja seputar tautan, kategori, atau hal lain yang bisa kubantu ya!",
          };
        }
        return m;
      })
    );
  }, [locale]);

  /** Handle Quick Capture — analyze URL, save as link */
  const handleQuickCapture = useCallback(async (msgId: string, url: string) => {
    // Mark as saving
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, captureState: "saving" as QuickCaptureState } : m))
    );

    try {
      // 1. Analyze the URL
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      let title = url;
      let description = "";
      let category = "Custom";
      let tags: string[] = [];
      let notes = "";
      let deadline: string | null = null;

      if (analyzeRes.ok) {
        const data = await analyzeRes.json();
        if (data.title) title = data.title;
        if (data.description) description = data.description;
        if (data.category) category = data.category;
        if (data.tags && Array.isArray(data.tags)) tags = data.tags;
        if (data.notes) notes = data.notes;
        if (data.deadline) deadline = data.deadline;
      }

      // 2. Save the link
      const saveRes = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          description,
          category,
          tags,
          notes,
          reminderAt: deadline || null,
        }),
      });

      if (saveRes.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, captureState: "saved" as QuickCaptureState, captureResult: { title, category } }
              : m
          )
        );

        // Add Liko confirmation message
        const confirmId = (Date.now() + 2).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: confirmId,
            role: "ai",
            content: locale === "en"
              ? `Link successfully saved.\n\nTitle: ${title}\nCategory: ${category}${tags.length > 0 ? `\nTags: ${tags.join(", ")}` : ""}`
              : `Tautan berhasil disimpan.\n\nJudul: ${title}\nKategori: ${category}${tags.length > 0 ? `\nTag: ${tags.join(", ")}` : ""}`,
          },
        ]);

        const savedData = await saveRes.json().catch(() => null);
        if (savedData) {
          window.dispatchEvent(new CustomEvent("liko-link-added", { detail: { link: savedData } }));
        }

        // Refresh data
        invalidateCache("/api/links");
        invalidateCache("/api/dashboard");
        invalidateCache("/api/collections");
        dispatchRefresh(["links", "dashboard", "collections"]);
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, captureState: "error" as QuickCaptureState } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, captureState: "error" as QuickCaptureState } : m))
      );
    }
  }, [locale]);

  const handleSaveAsNote = async (msgId: string, text: string) => {
    try {
      const cleanSnippet = text.replace(/<[^>]*>/g, "").trim().slice(0, 45).replace(/\n/g, " ") || (locale === "en" ? "Note from Liko AI" : "Catatan dari Liko AI");
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanSnippet,
          content: `<p>${text.replace(/\n/g, "<br/>")}</p>`,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan catatan.");
      }

      setSavedNoteMsgIds((prev) => new Set([...prev, msgId]));
      dispatchRefresh(["notes"]);
      toast.success(locale === "en" ? "Saved to Personal Notes!" : "Tersimpan di Personal Notes!", "Liko AI");
    } catch {
      toast.error(locale === "en" ? "Failed to save note to server." : "Gagal menyimpan catatan ke server.", locale === "en" ? "Failed" : "Gagal");
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    if (requireAuth(
        locale === "en" ? "Chat with Liko AI Assistant" : "Mengobrol dengan Asisten AI Liko",
        locale === "en" ? "Sign in or register for free to chat, find instant insights, and organize your digital assets with Liko AI." : "Masuk atau daftar gratis untuk mengobrol, mencari informasi instan, dan mengorganisir aset digital Anda dengan Asisten AI Liko."
      )) {
      return;
    }

    // Detect URL in the message
    const urlMatch = message.match(URL_REGEX);
    const detectedUrl = urlMatch ? urlMatch[0] : undefined;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      detectedUrl,
      captureState: detectedUrl ? "idle" : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.id !== "1"), userMsg],
          locale: locale || "id",
        })
      });

      if (!response.ok) {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(),
          role: "ai", 
          content: locale === "en" ? "Sorry, an error occurred while connecting to AI. Please try again." : "Maaf, terjadi kesalahan saat menghubungi server AI. Silakan coba lagi beberapa saat lagi." 
        }]);
        setIsTyping(false);
        return;
      }

      // Hide typing animation and create an empty AI message placeholder
      setIsTyping(false);
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: "ai", content: "" }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkText = decoder.decode(value, { stream: true });
          aiResponseText += chunkText;
          setMessages(prev =>
            prev.map(m => (m.id === aiMsgId ? { ...m, content: aiResponseText } : m))
          );
        }
      }
    } catch (_error) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: "ai", 
        content: locale === "en" ? "Sorry, a technical issue occurred. Please try again." : "Maaf, terjadi kendala teknis. Silakan coba lagi."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button with Mascot */}
      <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative w-13 h-13 sm:w-16 sm:h-16 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-all group outline-none cursor-pointer"
            >
              {/* Rotating outer aura ring */}
              <motion.div
                className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary via-accent to-purple-500 opacity-75 blur-[2px]"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner container with mascot */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background bg-background shadow-inner flex items-center justify-center">
                <img 
                  src="/maskot.jpeg" 
                  alt="Linkora AI Mascot" 
                  className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Online pulse indicator */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-success border-2 border-background z-20 shadow-sm" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-8 sm:bottom-24 z-[60] w-auto sm:w-[400px] h-[min(540px,78vh)] rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-border/80 bg-card/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border border-primary/30 overflow-hidden shadow-md bg-background flex-shrink-0">
                  <img 
                    src="/maskot.jpeg" 
                    alt="Linkora AI" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {locale === "en" ? "Liko (AI Assistant)" : "Liko (Asisten AI)"}
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Database className="w-2.5 h-2.5 text-primary" />
                    {locale === "en" ? "Connected to your workspace" : "Terhubung dengan koleksimu"}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 rounded-full transition-all text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-7 h-7 rounded-full border border-primary/30 overflow-hidden flex-shrink-0 mb-0.5 shadow-sm bg-background">
                      <img src="/maskot.jpeg" alt="Liko" className="w-full h-full object-cover object-top" />
                    </div>
                  )}
                  <div className="max-w-[80%] space-y-1.5">
                    <div 
                      className={`p-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm font-medium" 
                          : "bg-muted/80 backdrop-blur-sm text-foreground rounded-2xl rounded-bl-sm border border-border/50"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Quick Capture action buttons for messages with detected URLs */}
                    {msg.detectedUrl && msg.captureState === "idle" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => handleQuickCapture(msg.id, msg.detectedUrl!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation select-none"
                        >
                          <Link2 className="h-3 w-3" />
                          {locale === "en" ? "Save Link" : "Simpan Tautan"}
                        </button>
                      </motion.div>
                    )}

                    {/* Saving state */}
                    {msg.captureState === "saving" && (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {locale === "en" ? "Analyzing and saving..." : "Menganalisis dan menyimpan..."}
                      </div>
                    )}

                    {/* Saved state */}
                    {msg.captureState === "saved" && msg.captureResult && (
                      <div className="flex items-center gap-1.5 text-xs text-success font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {locale === "en" ? "Saved" : "Tersimpan"} — {msg.captureResult.category}
                      </div>
                    )}

                    {/* Error state */}
                    {msg.captureState === "error" && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{locale === "en" ? "Failed to save." : "Gagal menyimpan."}</span>
                        <button
                          type="button"
                          onClick={() => handleQuickCapture(msg.id, msg.detectedUrl!)}
                          className="text-xs text-primary underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {locale === "en" ? "Try again" : "Coba lagi"}
                        </button>
                      </div>
                    )}

                    {/* AI Message Action: Save as Note */}
                    {msg.role === "ai" && msg.id !== "1" && msg.content.length > 25 && !msg.detectedUrl && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {savedNoteMsgIds.has(msg.id) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-success font-semibold px-2 py-0.5 rounded-md bg-success-muted border border-success/30">
                            <CheckCircle className="h-3 w-3" />
                            {locale === "en" ? "Note Saved" : "Catatan Tersimpan"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSaveAsNote(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 touch-manipulation select-none"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                            <span>{locale === "en" ? "Save as Note" : "Simpan sebagai Catatan"}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-end gap-2"
                >
                  <div className="w-7 h-7 rounded-full border border-primary/30 overflow-hidden flex-shrink-0 mb-0.5 shadow-sm bg-background">
                    <img src="/maskot.jpeg" alt="Liko" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="bg-muted/80 backdrop-blur-sm p-3 rounded-2xl rounded-bl-sm border border-border/50 flex gap-1 items-center">
                    <motion.div className="w-1.5 h-1.5 bg-foreground/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-foreground/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-foreground/50 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2 items-center relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={locale === "en" ? "Ask anything or paste URL to save..." : "Tanya atau paste URL untuk simpan..."}
                  className="flex-1 bg-background/80 border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground shadow-sm transition-all"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="absolute right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover active:scale-90 disabled:opacity-0 disabled:scale-75 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                  aria-label={locale === "en" ? "Send Message" : "Kirim Pesan"}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
