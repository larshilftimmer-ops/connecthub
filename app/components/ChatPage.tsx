"use client";

import { useState, useRef, useEffect } from "react";

type Reaction = {
  emoji: string;
  users: string[];
};

type Message = {
  id: string;
  user_email: string;
  content: string;
  created_at: string;
  read_by?: string[];
  reactions?: Reaction[];
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
  addReaction?: (messageId: string, emoji: string) => void;
  markAsRead?: (messageId: string) => void;
  typingUsers?: string[];
  setTyping?: (isTyping: boolean) => void;
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
  addReaction,
  markAsRead,
  typingUsers = [],
  setTyping,
}: Props) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"groups" | "people">("groups");
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const quickReactions = ["👍", "❤️", "🔥", "😂", "🎵"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Mark messages as read
    messages.forEach((msg) => {
      if (!msg.read_by?.includes(currentUser?.email) && msg.user_email!== currentUser?.email) {
        markAsRead?.(msg.id);
      }
    });
  }, [messages, currentUser?.email, markAsRead]);

  useEffect(() => {
    if (selectedGroup && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [selectedGroup]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage();
    setTyping?.(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" &&!e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (value.trim()) {
      setTyping?.(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping?.(false), 2000);
    } else {
      setTyping?.(false);
    }
  };

  const startPrivateChat = (chatUser: any) => {
    const emails = [currentUser?.email, chatUser.email].sort();
    const privateGroupName = `Privat: ${emails[0]} ↔ ${emails[1]}`;
    setSelectedGroup(privateGroupName);
    setNewGroup(privateGroupName);
    createGroup();
  };

  const getInitials = (email: string) => email?.[0]?.toUpperCase() || "?";

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };

  const getReadStatus = (msg: Message) => {
    if (msg.user_email!== currentUser?.email) return null;
    const readByOthers = msg.read_by?.filter((email) => email!== currentUser?.email) || [];
    if (readByOthers.length > 0) {
      return <span className="text-[#00D9FF]">✓✓</span>; // Gelesen
    }
    return <span className="text-white/40">✓✓</span>; // Gesendet
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction?.(messageId, emoji);
    setShowEmojiPicker(null);
  };

  const getUnreadCount = (groupName: string) => {
    // Hier deine Logic für ungelesene Nachrichten
    // Return z.B. 3 für 3 ungelesene
    return 0;
  };

  return (
    <section className="relative w-full h-[calc(100vh-8rem)] bg-gradient-to-br from-[#0B1E3F] via-[#0F2A52] to-[#123456] rounded-3xl overflow-hidden flex">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[5%] text-[#00D9FF]/10 text-6xl animate-pulse">♪</div>
        <div className="absolute bottom-[15%] right-[10%] text-[#00D9FF]/10 text-7xl animate-pulse delay-500">♫</div>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          showSidebar? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } absolute lg:relative w-full lg:w-80 h-full bg-[#0B1E3F]/60 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 z-20 flex flex-col`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Chat</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden text-white/60 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "groups"
                 ? "bg-[#00D9FF] text-[#0B1E3F]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Gruppen
            </button>
            <button
              onClick={() => setActiveTab("people")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "people"
                 ? "bg-[#00D9FF] text-[#0B1E3F]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Personen
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === "groups" && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                <input
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  placeholder="Neue Gruppe..."
                  className="w-full bg-white/10 border border-white/20 text-white text-sm p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-[#00D9FF] placeholder:text-white/40 mb-2"
                />
                <button
                  onClick={createGroup}
                  className="w-full bg-gradient-to-r from-[#00D9FF] to-[#0099CC] text-[#0B1E3F] font-semibold py-2 rounded-lg text-sm active:scale-95 transition"
                >
                  Erstellen
                </button>
              </div>

              {groups.length === 0? (
                <p className="text-white/40 text-sm text-center py-8">Keine Gruppen</p>
              ) : (
                groups.map((group) => {
                  const unread = getUnreadCount(group.name);
                  return (
                    <div key={group.id} className="group relative">
                      <button
                        onClick={() => setSelectedGroup(group.name)}
                        className={`w-full p-3 rounded-xl text-left transition flex items-center gap-3 ${
                          selectedGroup === group.name
                           ? "bg-[#00D9FF]/20 border border-[#00D9FF]/50"
                            : "bg-white/5 hover:bg-white/10 border border-transparent"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-[#0B1E3F] font-bold shrink-0">
                            #
                          </div>
                          {unread > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                              {unread}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white text-sm truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-white/50">Gruppenchat</p>
                        </div>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/30 text-red-300 w-7 h-7 rounded-lg text-xs transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === "people" && (
            <>
              {chatUsers
               .filter((chatUser) => chatUser.email!== currentUser?.email)
               .map((chatUser) => (
                  <button
                    key={chatUser.email}
                    onClick={() => startPrivateChat(chatUser)}
                    className="w-full p-3 rounded-xl text-left bg-white/5 hover:bg-white/10 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                      {getInitials(chatUser.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm truncate">
                        {chatUser.name || chatUser.email}
                      </p>
                      <p className="text-xs text-white/50 truncate">{chatUser.email}</p>
                    </div>
                  </button>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedGroup? (
          <>
            {/* Chat Header */}
            <div className="bg-[#0B1E3F]/60 backdrop-blur-xl border-b border-white/10 p-4 flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden text-white/60 hover:text-white"
              >
                ←
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-[#0B1E3F] font-bold">
                {selectedGroup.startsWith("Privat")? "👤" : "#"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white truncate">{selectedGroup}</h3>
                <p className="text-xs text-white/50">
                  {typingUsers.length > 0
                   ? `${typingUsers.join(", ")} schreibt...`
                    : `${messages.length} Nachrichten`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-3 opacity-20">💬</div>
                    <p className="text-white/40">Noch keine Nachrichten</p>
                    <p className="text-white/30 text-sm mt-1">Schreibe die erste!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.user_email === currentUser?.email;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 group ${isOwn? "flex-row-reverse" : ""}`}
                      onMouseEnter={() => setHoveredMessage(msg.id)}
                      onMouseLeave={() => setHoveredMessage(null)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(msg.user_email)}
                      </div>
                      <div className={`max-w-[70%] ${isOwn? "items-end" : ""} flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-white/60">{msg.user_email}</p>
                          <p className="text-xs text-white/40">{formatTime(msg.created_at)}</p>
                        </div>
                        
                        <div className="relative">
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isOwn
                               ? "bg-gradient-to-br from-[#00D9FF] to-[#0099CC] text-[#0B1E3F] rounded-tr-sm"
                                : "bg-white/10 backdrop-blur-lg text-white rounded-tl-sm border border-white/10"
                            }`}
                          >
                            <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                          </div>

                          {/* Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {msg.reactions.map((reaction, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleReaction(msg.id, reaction.emoji)}
                                  className={`text-xs px-2 py-0.5 rounded-full border transition ${
                                    reaction.users.includes(currentUser?.email)
                                     ? "bg-[#00D9FF]/20 border-[#00D9FF]/50 text-[#00D9FF]"
                                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                  }`}
                                >
                                  {reaction.emoji} {reaction.users.length}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Quick Reactions on Hover */}
                          {hoveredMessage === msg.id && (
                            <div className="absolute -top-8 left-0 bg-[#0B1E3F]/90 backdrop-blur-xl border border-white/20 rounded-xl p-1 flex gap-1 shadow-xl">
                              {quickReactions.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="hover:bg-white/10 w-8 h-8 rounded-lg transition text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Read Receipt */}
                        <div className="flex items-center gap-1 mt-0.5 text-xs">
                          {getReadStatus(msg)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10"></div>
                  <div className="bg-white/10 backdrop-blur-lg px-4 py-2.5 rounded-2xl rounded-tl-sm border border-white/10">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#0B1E3F]/60 backdrop-blur-xl border-t border-white/10 p-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 bg-white/10 border border-white/20 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00D9FF] placeholder:text-white/40 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-[#00D9FF] to-[#0099CC] disabled:opacity-30 disabled:cursor-not-allowed text-[#0B1E3F] font-bold px-5 rounded-xl active:scale-95 transition shadow-lg"
                >
                  →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4 opacity-20">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Wähle einen Chat</h3>
              <p className="text-white/40">Suche dir eine Gruppe oder Person aus</p>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden mt-4 bg-[#00D9FF] text-[#0B1E3F] font-semibold px-6 py-2.5 rounded-xl"
              >
                Chats anzeigen
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}