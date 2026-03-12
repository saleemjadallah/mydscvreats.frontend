"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { MenuAssistantMessage } from "@/types";

type ChatMessage = MenuAssistantMessage & {
  id: string;
};

const CHEF_AVATAR_URL =
  "https://eats-images.mydscvr.ai/assets/chef-avatars/chef-avatar-friendly.jpg";
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
  side = "right",
}: {
  restaurantId: string;
  restaurantName: string;
  side?: "left" | "right";
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
      <div
        className={`fixed bottom-6 z-[60] ${side === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6"}`}
      >
        {!isOpen && showHint ? (
          <div className={`mb-3 flex ${side === "left" ? "justify-start" : "justify-end"}`}>
            <div className="rounded-full border border-[#F2D58B] bg-white/95 px-3 py-1.5 text-xs font-medium text-[#7A5510] shadow-lg backdrop-blur">
              Ask about the menu
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "relative h-16 w-16 overflow-hidden rounded-full shadow-[0_20px_45px_rgba(129,83,14,0.28)] transition-all hover:scale-[1.02]",
            isOpen ? "pointer-events-none scale-95 opacity-0" : "opacity-100"
          )}
          aria-label="Open AI menu assistant"
        >
          {showPulse ? (
            <span className="absolute inset-0 rounded-full bg-[#E8A317] animate-ping opacity-30 z-10" />
          ) : null}
          <Image
            src={CHEF_AVATAR_URL}
            alt="AI Chef"
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        </button>
      </div>

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end sm:inset-auto sm:bottom-6 ${
          side === "left" ? "sm:left-6 sm:right-auto" : "sm:right-6"
        }`}
      >
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
              <div className="flex items-center gap-3">
                <Image
                  src={CHEF_AVATAR_URL}
                  alt="AI Chef"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-[#F2D58B]"
                />
                <div>
                  <div className="text-sm font-semibold text-ink">{restaurantName}</div>
                <div className="text-xs text-stone">Sous Chef</div>
                </div>
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
                  message.role === "user" ? "justify-end" : "items-end gap-2"
                )}
              >
                {message.role === "assistant" ? (
                  <Image
                    src={CHEF_AVATAR_URL}
                    alt=""
                    width={24}
                    height={24}
                    className="mb-0.5 h-6 w-6 flex-shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-[#E8A317] text-white"
                      : "rounded-bl-md bg-[#F4F1EA] text-ink"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Markdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>
                        ),
                        li: ({ children }) => <li className="pl-0.5">{children}</li>,
                        table: ({ children }) => (
                          <div className="my-2 overflow-x-auto rounded-lg border border-[#E7DAC5] last:mb-0">
                            <table className="w-full text-left text-xs">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="border-b border-[#E7DAC5] bg-[#FAF5EC] text-[#7A5510]">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="px-2.5 py-1.5 font-semibold">{children}</th>
                        ),
                        td: ({ children }) => (
                          <td className="px-2.5 py-1.5">{children}</td>
                        ),
                        tr: ({ children }) => (
                          <tr className="border-b border-[#F3E7D4] last:border-0">{children}</tr>
                        ),
                        h1: ({ children }) => (
                          <p className="mb-1.5 font-semibold">{children}</p>
                        ),
                        h2: ({ children }) => (
                          <p className="mb-1.5 font-semibold">{children}</p>
                        ),
                        h3: ({ children }) => (
                          <p className="mb-1 font-semibold">{children}</p>
                        ),
                        hr: () => <hr className="my-2 border-[#E7DAC5]" />,
                      }}
                    >
                      {message.content}
                    </Markdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="flex items-end gap-2">
                <Image
                  src={CHEF_AVATAR_URL}
                  alt=""
                  width={24}
                  height={24}
                  className="mb-0.5 h-6 w-6 flex-shrink-0 rounded-full object-cover"
                />
                <TypingIndicator />
              </div>
            ) : null}
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
