"use client";

import { useState, useRef, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import Header from "@/components/Header";
import { Message, Chat } from "@/types/chat";
import { generateId } from "@/lib/utils";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [streamingText, setStreamingText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      model: "gemini-2.0-flash",
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const renameChat = (chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title } : c))
    );
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setStreamingText("");
  };

  const sendMessage = async (content: string) => {
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    // Add user message
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title:
                c.messages.length === 0
                  ? content.slice(0, 40) + (content.length > 40 ? "…" : "")
                  : c.title,
            }
          : c
      )
    );

    setIsLoading(true);
    setStreamingText("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Get updated messages for API call
      const currentChat = chats.find((c) => c.id === chatId);
      const messages = [...(currentChat?.messages || []), userMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: currentChat?.model || "gemini-2.0-flash",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamingText(fullText);
                }
              } catch {}
            }
          }
        }
      }

      // Save complete AI message
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: fullText,
        createdAt: new Date(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, aiMessage] }
            : c
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "⚠️ Error: Kuch gadbad ho gayi. Dobara try karein.",
          createdAt: new Date(),
        };
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, errorMessage] }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingText("");
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="app-container">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <div className={`main-area ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Header
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          chatTitle={activeChat?.title}
        />
        <ChatMessages
          messages={activeChat?.messages || []}
          streamingText={streamingText}
          isLoading={isLoading}
        />
        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
