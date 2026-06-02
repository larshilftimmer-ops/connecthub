"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  user_email: string;
  content: string;
  created_at: string;
  read_by?: string[];
};

type Props = {
  groups: any[];
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  isAdmin: boolean;
  deleteGroup: (id: string) => void;
  newGroup: string;
  setNewGroup: (value: string) => void;
  createGroup: () => void;
  message: string;
  setMessage: (value: string) => void;
  sendMessage: () => void;
  messages: Message[];
  chatUsers: any[];
  currentUser: any;
};

export default function ChatPage({
  groups,
  selectedGroup,
  setSelectedGroup,
  isAdmin,
  deleteGroup,
  newGroup,
  setNewGroup,
  createGroup,
  message,
  setMessage,
  sendMessage,
  messages,
  chatUsers,
  currentUser,
}: Props) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedGroup && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" &&!e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateGroup = () => {
    if (!newGroup.trim()) return;
    createGroup();
    setShowCreateModal(false);
    setNewGroup("");
  };

  const startPrivateChat = (chatUser: any) => {
    const emails = [currentUser?.email, chatUser.email].sort();
    const privateGroupName = `${chatUser.name || chatUser.email}`;
    setSelectedGroup(privateGroupName);
    setNewGroup(privateGroupName);
    createGroup();
  };

  const getInitials = (email: string) => email?.[0]?.toUpperCase() || "?";
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("de-DE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = chatUsers
 .filter((u) => u.email!== currentUser?.email)
 .filter((u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-[#0B1E3F] rounded-2xl overflow-hidden flex">
      
      {/* Sidebar */}
      <div
        className={`${
          showSidebar? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } absolute lg:relative w-full lg:w-72 h-full bg-[#0F2A52] border-r border-white/5 transition-transform duration-200 z-20 flex flex-col`}
      >
        {/* Search */}
        <div className="p-3 border-b border-white/5">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="w-full bg-white/5 border-0 text-white text-sm px-3 py-2 rounded-lg outline-none focus:bg-white/10 placeholder:text-white/30"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Gruppen */}
          {filteredGroups.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-xs font-semibold text-white/40 uppercase">
                Gruppen
              </p>
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.name)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition group ${
                    selectedGroup === group.name? "bg-white/10" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#00D9FF]/20 flex items-center justify-center text-[#00D9FF] text-lg shrink-0">
                    #
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-medium text-white text-sm truncate">
                      {group.name}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(group.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 text-sm transition"
                    >
                      ✕
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Personen */}
          {filteredUsers.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-xs font-semibold text-white/40 uppercase">
                Personen
              </p>
              {filteredUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => startPrivateChat(user)}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-[#0B1E3F] font-bold shrink-0">
                    {getInitials(user.email)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-medium text-white text-sm truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* FAB für Gruppe erstellen */}
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="absolute bottom-4 right-4 w-14 h-14 bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] rounded-full shadow-lg shadow-[#00D9FF]/30 flex items-center justify-center text-2xl font-light active:scale-95 transition"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0B1E3F]">
        {selectedGroup? (
          <>
            <div className="bg-[#0F2A52] border-b border-white/5 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden text-white/60 hover:text-white"
              >
                ←
              </button>
              <div className="w-9 h-9 rounded-full bg-[#00D9FF]/20 flex items-center justify-center text-[#00D9FF]">
                #
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white truncate text-sm">
                  {selectedGroup}
                </h3>
                <p className="text-xs text-white/40">{messages.length} Nachrichten</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.length === 0? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 opacity-10">💬</div>
                    <p className="text-white/30 text-sm">Schreibe die erste Nachricht</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.user_email === currentUser?.email;
                  const showAvatar = idx === 0 || messages[idx - 1].user_email!== msg.user_email;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isOwn? "justify-end" : ""} ${
                    !showAvatar? "ml-10" : ""
                      }`}
                    >
                      {!isOwn && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-[#0B1E3F] text-xs font-bold shrink-0 mt-1">
                          {getInitials(msg.user_email)}
                        </div>
                      )}
                      <div className={`max-w-[75%] flex flex-col ${isOwn? "items-end" : ""}`}>
                        {showAvatar && (
                          <p className="text-xs text-white/40 mb-0.5 px-1">
                            {msg.user_email} · {formatTime(msg.created_at)}
                          </p>
                        )}
                        <div
                          className={`px-3.5 py-2 rounded-2xl ${
                            isOwn
                          ? "bg-[#00D9FF] text-[#0B1E3F] rounded-br-md"
                              : "bg-[#1A3A5C] text-white rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#0F2A52] border-t border-white/5 p-3">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nachricht..."
                  className="flex-1 bg-white/5 border-0 text-white px-4 py-2.5 rounded-xl outline-none focus:bg-white/10 placeholder:text-white/30 text-sm resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-[#00D9FF] disabled:opacity-30 disabled:cursor-not-allowed text-[#0B1E3F] w-10 h-10 rounded-xl flex items-center justify-center font-bold active:scale-95 transition shrink-0"
                >
                  →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-3 opacity-10">💬</div>
              <p className="text-white/30 text-sm">Wähle einen Chat aus</p>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden mt-3 bg-[#00D9FF] text-[#0B1E3F] font-semibold px-5 py-2 rounded-lg text-sm"
              >
                Chats
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal für Gruppe erstellen */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-[#0F2A52] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-4">Neue Gruppe</h3>
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateGroup()}
              placeholder="Gruppenname..."
              autoFocus
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-[#00D9FF] placeholder:text-white/30 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-semibold transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroup.trim()}
                className="flex-1 bg-[#00D9FF] disabled:opacity-30 text-[#0B1E3F] py-2.5 rounded-xl font-semibold transition active:scale-95"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}