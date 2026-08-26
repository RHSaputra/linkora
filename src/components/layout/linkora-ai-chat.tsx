"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function LinkoraAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Halo! Aku Liko, asisten kamu di Linkora. Ada tautan atau catatan yang mau kubantu cari atau rapikan hari ini?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: message };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Filter out the initial greeting from sending as it's not a real conversation turn
          messages: [...messages.filter(m => m.id !== "1"), userMsg]
        })
      });

      if (!response.ok) {
        let errMsg = "Maaf, terjadi kesalahan pada koneksi ke server AI.";
        if (response.status === 503) {
          errMsg = "Layanan AI sedang sibuk (kapasitas penuh dari Google). Silakan coba lagi beberapa saat.";
        }
        
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(),
          role: "ai", 
          content: errMsg
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
        content: "Maaf, terjadi kendala teknis. Silakan coba lagi."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button with Mascot */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full shadow-[0_0_25px_rgba(var(--primary),0.4)] flex items-center justify-center transition-all group outline-none cursor-pointer"
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
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background z-20 shadow-sm" />
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
            className="fixed bottom-24 right-8 z-[60] w-80 sm:w-[400px] h-[550px] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-border/80 bg-card"
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
                    Liko (Asisten AI)
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Siap Membantu
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 rounded-full transition-all text-foreground cursor-pointer"
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
                  <div 
                    className={`max-w-[80%] p-3 text-sm shadow-sm leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm font-medium" 
                        : "bg-muted/80 backdrop-blur-sm text-foreground rounded-2xl rounded-bl-sm border border-border/50"
                    }`}
                  >
                    {msg.content}
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
                  placeholder="Tanya sesuatu ke Liko..."
                  className="flex-1 bg-background/80 border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground shadow-sm transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="absolute right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-90 disabled:opacity-0 disabled:scale-75 transition-all cursor-pointer"
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
