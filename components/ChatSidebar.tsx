"use client";

import { useState } from "react";
import { Plus, Trash2, MessageSquare, ChevronLeft, Edit2, Check, X } from "lucide-react";
import { Chat } from "@/types/chat";
import { formatDate } from "@/lib/utils";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) onRenameChat(id, editTitle.trim());
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Group chats by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  const grouped: Record<string, Chat[]> = {};
  chats.forEach((chat) => {
    const d = new Date(chat.createdAt).toDateString();
    const label = d === today ? "Aaj" : d === yesterday ? "Kal" : formatDate(new Date(chat.createdAt));
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(chat);
  });

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onToggle} />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">⬡ ARPA</span>
          <button className="icon-btn" onClick={onToggle}>
            <ChevronLeft size={18} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={16} />
          Naya Chat
        </button>

        <div className="chat-list">
          {chats.length === 0 ? (
            <p className="empty-hint">Abhi koi chat nahi hai</p>
          ) : (
            Object.entries(grouped).map(([label, groupChats]) => (
              <div key={label} className="chat-group">
                <span className="chat-group-label">{label}</span>
                {groupChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item ${chat.id === activeChatId ? "chat-item--active" : ""}`}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare size={14} className="chat-item-icon" />
                    {editingId === chat.id ? (
                      <div className="edit-row" onClick={(e) => e.stopPropagation()}>
                        <input
                          className="edit-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(chat.id, e as unknown as React.MouseEvent);
                            if (e.key === "Escape") cancelEdit(e as unknown as React.MouseEvent);
                          }}
                          autoFocus
                        />
                        <button onClick={(e) => saveEdit(chat.id, e)} className="action-btn action-btn--green">
                          <Check size={12} />
                        </button>
                        <button onClick={cancelEdit} className="action-btn action-btn--red">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="chat-item-title">{chat.title}</span>
                        <div className="chat-item-actions">
                          <button
                            className="action-btn"
                            onClick={(e) => startEdit(chat, e)}
                            title="Rename"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="action-btn action-btn--red"
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
