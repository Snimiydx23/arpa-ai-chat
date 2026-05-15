"use client";

import { Menu, Bot } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  chatTitle?: string;
}

export default function Header({ onToggleSidebar, chatTitle }: HeaderProps) {
  return (
    <header className="header">
      <button className="icon-btn" onClick={onToggleSidebar} title="Sidebar toggle">
        <Menu size={20} />
      </button>
      <div className="header-title">
        <Bot size={18} className="bot-icon" />
        <span>{chatTitle || "ARPA AI Chat"}</span>
      </div>
      <div className="header-badge">Gemini</div>
    </header>
  );
}
