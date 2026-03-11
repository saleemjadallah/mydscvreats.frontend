"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { MenuAssistantMessage } from "@/types";

type ChatMessage = MenuAssistantMessage & {
  id: string;
};

const WELCOME_MESSAGE =
  "Hi! I can answer questions about our menu - ingredients, spice levels, portions, or help you decide what to order 😊";
const FALLBACK_ERROR =
  "Sorry, I'm having trouble right now. Please ask a staff member!";

function TypingIndicator() {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#F4F1EA] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-stone/60 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-stone/60 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-stone/60" />
      </div>
    </div>
  );
}

export function MenuAIChat({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showPulse, setShowPulse] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pulseTimer = window.setTimeout(() => setShowPulse(false), 1400);
    const hintTimer = window.setTimeout(() => setShowHint(false), 4500);

    return () => {
      window.clearTimeout(pulseTimer);
      window.clearTimeout(hintTimer);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  async function sendMessage() {
    const trimmed = input.trim();

    if (!trimmed || isTyping) {
      return;
    }

    const history = messages.map(({ role, content }) => ({ role, content }));
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await apiClient.chatWithMenuAI(restaurantId, trimmed, history);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: FALLBACK_ERROR,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[60]">
        {!isOpen && showHint ? (
          <div className="mb-3 flex justify-end">
            <div className="rounded-full border border-[#F2D58B] bg-white/95 px-3 py-1.5 text-xs font-medium text-[#7A5510] shadow-lg backdrop-blur">
              Ask about the menu
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full bg-[#E8A317] text-white shadow-[0_20px_45px_rgba(129,83,14,0.28)] transition-all hover:scale-[1.02]",
            isOpen ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
          )}
          aria-label="Open AI menu assistant"
        >
          {showPulse ? (
            <span className="absolute inset-0 rounded-full bg-[#E8A317] animate-ping opacity-30" />
          ) : null}
          <MessageCircle className="relative h-6 w-6" />
        </button>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end sm:inset-auto sm:bottom-6 sm:right-6">
        <div
          className={cn(
            "flex h-[85vh] max-h-[32rem] w-full flex-col overflow-hidden border border-[#EEDFC1] bg-white shadow-2xl transition-all duration-300 sm:w-80 sm:rounded-2xl",
            "rounded-t-[28px] rounded-b-none sm:rounded-b-2xl",
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "translate-y-8 opacity-0 sm:translate-y-4"
          )}
        >
          <div className="border-b border-[#F3E7D4] bg-[linear-gradient(135deg,#FFF8EA,#FFFDF9)] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-ink">{restaurantName}</div>
                <div className="text-xs text-stone">AI Menu Assistant</div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone shadow-sm transition-colors hover:text-ink"
                aria-label="Close AI menu assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#FFFDF9] px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-[#E8A317] text-white"
                      : "rounded-bl-md bg-[#F4F1EA] text-ink"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping ? <TypingIndicator /> : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#F3E7D4] bg-white p-3">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask about spice, ingredients, or portions"
                disabled={isTyping}
                className="h-11 border-[#E7DAC5] bg-[#FFFDF9]"
              />
              <Button
                type="button"
                onClick={() => void sendMessage()}
                disabled={isTyping || !input.trim()}
                className="h-11 w-11 rounded-full bg-[#E8A317] p-0 text-white hover:bg-[#D79612]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
