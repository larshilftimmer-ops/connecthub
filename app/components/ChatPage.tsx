"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../supabase";

type Message = {
  id: string;
  user_email: string;
  content: string;
  created_at: string;
  group_name: string;
  read_by?: string[];
};

type Group = {
  id: string;
  name: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.email);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = user;
  const isAdmin = 
    profile?.role === "admin" ||
    ["l.c.petersen2@gmail.com", "kartmann@musikschulebadsoden.de", "info@musikschulebadsoden.de", "kopp_m@musikschulebadsoden.de"].includes(user?.email || "");

  // Supabase: Groups laden
  useEffect(() => {
    if (!user) return;
    
    const fetchGroups = async () => {
      const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
      
      if (!error) setGroups(data || []);
    };
    
    fetchGroups();

    // Realtime für Groups
    const channel = supabase
    .channel('groups')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, fetchGroups)
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, );

  // Supabase: Users laden
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role');
      
      if (!error) setChatUsers(data || []);
    };
    
    fetchUsers();
  }, );

  // Supabase: Messages laden + Realtime
  useEffect(() => {
    if (!selectedGroup ||!user) return;
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_name', selectedGroup)
      .order('created_at', { ascending: true });
      
      if (!error) setMessages(data || []);
    };
    
    fetchMessages();

    // Realtime Subscription
    const channel = supabase
    .channel(`messages:${selectedGroup}`)
    .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages', 
          filter: `group_name=eq.${selectedGroup}` 
        },
        () => fetchMessages()
      )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedGroup && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [selectedGroup]);

  const sendMessage = async () => {
    if (!message.trim() ||!selectedGroup ||!user?.email) return;
    
    const { error } = await supabase.from('messages').insert({
      content: message.trim(),
      user_email: user.email,
      group_name: selectedGroup,
    });
    
    if (!error) setMessage("");
  };

  const createGroup = async () => {
    if (!newGroup.trim() ||!user?.email) return;
    
    const { error } = await supabase.from('groups').insert({
      name: newGroup.trim(),
      is_group: true,
      created_by: user.email,
    });
    
    if (!error) {
      setNewGroup("");
      setShowCreateModal(false);
    }
  };

  const deleteGroup = async (id: string) => {
    await supabase.from('messages').delete().eq('group_name', groups.find(g => g.id === id)?.name);
    await supabase.from('groups').delete().eq('id', id);
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
  };

  const deleteChat = async (groupName: string) => {
    await supabase.from('messages').delete().eq('group_name', groupName);
    await supabase.from('groups').delete().eq('name', groupName);
  };

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
  };

  const startPrivateChat = async (chatUser: any) => {
    const privateGroupName = chatUser.email;
    
    const { data: existing } = await supabase
    .from('groups')
    .select('*')
    .eq('name', privateGroupName)
    .single();
    
    if (!existing) {
      await supabase.from('groups').insert({
        name: privateGroupName,
        is_group: false,
        created_by: user?.email,
      });
    }
    
    setSelectedGroup(privateGroupName);
  };

  const getInitials = (email: string) => email?.[0]?.toUpperCase() || "?";
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("de-DE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const isPrivateChat = (groupName: string) => {
    return!(groups || []).find(g => g.name === groupName && g.is_group);
  };

  const canDeleteChat = selectedGroup && (isAdmin || isPrivateChat(selectedGroup));

  const handleDeleteChat = () => {
    if (!canDeleteChat) return;
    setShowDeleteConfirm(selectedGroup);
  };

  const confirmDeleteChat = () => {
    if (showDeleteConfirm) {
      deleteChat(showDeleteConfirm);
      setSelectedGroup("");
      setShowDeleteConfirm(null);
    }
  };

  const handleDeleteGroup = (group: any) => {
    if (confirm(`Gruppe "${group.name}" wirklich löschen?`)) {
      deleteGroup(group.id);
      if (selectedGroup === group.name) {
        setSelectedGroup("");
      }
    }
  };

  const filteredGroups = (groups || []).filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = (chatUsers || [])
 .filter((u) => u.email!== currentUser?.email)
 .filter((u) =>
      `${u.name || ''} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="w-full h-[calc(100vh-7rem)] bg-[#0B1E3F] rounded-2xl overflow-hidden flex">
      
      {/* Sidebar */}
      <div
        className={`${
          showSidebar? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } absolute lg:relative w-full lg:w-72 h-full bg-[#0F2A52] border-r border-white/5 transition-transform duration-200 z-20 flex flex-col`}
      >
        <div className="p-3 border-b border-white/5 flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="flex-1 bg-white/5 border-0 text-white text-sm px-3 py-2 rounded-lg outline-none focus:bg-white/10 placeholder:text-white/30"
          />
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#00D9FF] hover:bg-[#00D9FF]/90 text-[#0B1E3F] w-9 h-9 rounded-lg flex items-center justify-center text-xl font-light active:scale-95 transition shrink-0"
              title="Neue Gruppe"
            >
              +
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-xs font-semibold text-white/40 uppercase">
                Gruppen
              </p>
              {filteredGroups.map((group) => (
                <div key={group.id} className="group flex items-center hover:bg-white/5 transition">
                  <button
                    onClick={() => setSelectedGroup(group.name)}
                    className={`flex-1 px-3 py-2.5 flex items-center gap-3 ${
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
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="mr-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition opacity-0 group-hover:opacity-100"
                      title="Gruppe löschen"
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

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
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0B1E3F]">
        {selectedGroup? (
          <>
            <div className="bg-[#0F2A52] border-b border-white/5 px-3 py-2.5 flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden text-white/60 hover:text-white shrink-0"
              >
                ←
              </button>
              <div className="w-8 h-8 rounded-full bg-[#00D9FF]/20 flex items-center justify-center text-[#00D9FF] text-sm shrink-0">
                #
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white truncate text-sm">
                  {selectedGroup}
                </h3>
                <p className="text-xs text-white/40">{(messages || []).length} Nachrichten</p>
              </div>
              
              {canDeleteChat && (
                <button
                  onClick={handleDeleteChat}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 w-9 h-9 rounded-lg flex items-center justify-center text-lg active:scale-95 transition shrink-0"
                  title="Chat löschen"
                >
                  🗑
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {(messages || []).length === 0? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 opacity-10">💬</div>
                    <p className="text-white/30 text-sm">Schreibe die erste Nachricht</p>
                  </div>
                </div>
              ) : (
                (messages || []).map((msg, idx) => {
                  const isOwn = msg.user_email === currentUser?.email;
                  const showAvatar = idx === 0 || (messages || [])[idx - 1].user_email!== msg.user_email;
                  const canDelete = isOwn || isAdmin;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 group ${isOwn? "justify-end" : ""} ${
                      !showAvatar? "ml-10" : ""
                      }`}
                      onMouseEnter={() => setHoveredMessage(msg.id)}
                      onMouseLeave={() => setHoveredMessage(null)}
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
                        <div className="relative flex items-start gap-2">
                          {canDelete && hoveredMessage === msg.id && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded-lg text-xs transition shrink-0"
                            >
                              Löschen
                            </button>
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
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#0F2A52] border-t border-white/5 p-3">
              <div className="flex items-end gap-2">
                <input
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
            <h3 className="text-lg font-bold text-white mb-4">Neue Gruppe erstellen</h3>
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

      {/* Modal für Chat löschen Bestätigung */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div 
            className="bg-[#0F2A52] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Chat löschen?</h3>
            <p className="text-white/60 text-sm mb-4">
              "{showDeleteConfirm}" und alle Nachrichten werden unwiderruflich gelöscht.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-semibold transition"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDeleteChat}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold transition active:scale-95"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}