import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getChatHistory, saveChatMessage, clearChatHistory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2, Loader2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage } from "@/types";

const SYSTEM_PROMPT = "You are MeetingWeaver AI, a meeting intelligence assistant. You help users analyze meeting transcripts, extract action items, summarize discussions, track decisions, and improve meeting productivity.";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const res = await getChatHistory();
      if (res.success) setMessages(res.data || []);
      setInitialLoad(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    // Save user message
    const userRes = await saveChatMessage("user", text);
    if (userRes.success && userRes.data) {
      setMessages((prev) => [...prev, userRes.data!]);
    }

    setTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Build full history for the AI call, including system prompt
      const history = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectId: "chat",
          documents: "",
          chatMode: true,
          messages: history,
        }),
      });

      if (!resp.ok) {
        throw new Error("AI request failed");
      }

      // Read streaming response
      let assistantText = "";
      if (resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ") || line.trim() === "") continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "step" || parsed.type === "metrics") continue;
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) assistantText += content;
            } catch {
              // Incomplete JSON, continue
            }
          }
        }
      }

      // Fallback if streaming returned nothing
      if (!assistantText) {
        assistantText = "I'm sorry, I couldn't process that request. Please try again.";
      }

      // Save assistant message
      const asstRes = await saveChatMessage("assistant", assistantText);
      if (asstRes.success && asstRes.data) {
        setMessages((prev) => [...prev, asstRes.data!]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(errMsg);
      // Still save a fallback message
      const fallback = await saveChatMessage("assistant", "Sorry, I encountered an error. Please try again.");
      if (fallback.success && fallback.data) {
        setMessages((prev) => [...prev, fallback.data!]);
      }
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  const handleClear = async () => {
    const res = await clearChatHistory();
    if (res.success) {
      setMessages([]);
      toast.success("Conversation cleared");
    } else {
      toast.error("Failed to clear conversation");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Chat</h1>
          <p className="text-sm text-muted-foreground">Ask MeetingWeaver AI about your meetings</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear} disabled={messages.length === 0}>
          <Trash2 className="w-4 h-4 mr-1.5" /> Clear
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-card rounded-xl border border-border p-4 space-y-4 mb-4">
        {initialLoad ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">MeetingWeaver AI</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              I can help you analyze meeting transcripts, extract action items, summarize discussions, and track decisions.
            </p>
          </div>
        ) : (
          messages.filter((m) => m.role !== "system").map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "200ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "400ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your meetings..."
          rows={1}
          className="resize-none min-h-[44px] max-h-[120px]"
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="px-4 self-end">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
