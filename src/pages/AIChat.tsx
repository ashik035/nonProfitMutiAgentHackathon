import { useState, useRef, useEffect, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Loader2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the AI assistant for Brightside Foundation, a nonprofit organization using Nonprofit Control Tower. You have access to their operational data: 1,847 active donors, 4 active grants totaling $497,000, Q1 revenue of $487,000 (95% of $510K target), 82% data health score, 5 active AI agents. The organization uses Salesforce as their CRM and Stripe for payments. Answer questions about their nonprofit operations concisely and helpfully. Reference specific data when relevant. If asked about tasks the system can do, offer to navigate to the relevant page.`;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "How many duplicate records do we have right now?",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "The CRM Data Integrity Agent has flagged **12 potential duplicate records** in Brightside Foundation's Salesforce. The 3 highest-confidence matches are:\n\n1. **Sarah Chen** (94% match)\n2. **Jennifer Walsh** (99% match — likely a same-day double entry)\n3. **Michael Torres** (87% match)\n\nWould you like me to take you to the **Data Health** page to review and approve merges?",
  },
  {
    id: "3",
    role: "user",
    content: "What grants are at risk?",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "One grant is currently flagged **at risk**: the **Kresge Foundation Community Health Initiative** ($185,000). The compliance report is due in **8 days** and fund utilization is at **61%** — below the expected pace. The narrative draft has not been started.\n\nI'd recommend assigning this to **Kevin Park** immediately. Want me to open the grant details?",
  },
];

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "AI Chat | Brightside Foundation";
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const allMessages = [...messages, userMsg];
      const apiMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...allMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: apiMessages, max_tokens: 500 },
      });

      if (error) throw error;
      const assistantContent = data?.response || "I wasn't able to process that request. Please try again.";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: assistantContent },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Chat</h1>
        <p className="text-sm text-muted-foreground">
          Brightside Foundation · Ask questions about your nonprofit operations
        </p>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 max-w-[80%] text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 border text-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ol]:mb-2 [&>ul]:mb-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isStreaming && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-muted/50 border">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about donors, grants, events, or data health…"
              disabled={isStreaming}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isStreaming || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
