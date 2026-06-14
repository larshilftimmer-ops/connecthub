"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = {
  id: string;
  user_email: string;
  content: string;
  created_at: string;
  read_by?: string[];
};

type Props = {
  user: any;
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
  deleteMessage?: (id: string) => void;
  deleteChat?: (groupName: string) => void;
  refreshGroups?: () => void;
};

export default function ChatPage({
  user,
  groups,
  selectedGroup,
  setSelectedGroup,
  isAdmin,
  deleteGroup,
  newGroup,
  setNewGroup,
  createGroup: _parentCreateGroup,
  message,
  setMessage,
  sendMessage,
  messages,
  chatUsers,
  currentUser,
  deleteMessage,
  deleteChat,
  refreshGroups,
}: Props) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedGroup && window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  }, [selectedGroup]);

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

  // GRUPPE ERSTELLEN - DSGVO + BEIDE MEMBER
  const handleCreateGroup = async () => {
    if (!newGroup.trim() || isCreating || selectedMembers.length === 0) return;
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        alert("Bitte anmelden");
        setIsCreating(false);
        return;
      }

      // 1. Gruppe anlegen
      const { data: conversation, error: convError } = await supabase
       .from("conversations")
       .insert({
          name: newGroup.trim(),
          is_group: true,
          created_by: user.email
        })
       .select()
       .single();

      if (convError) throw convError;

      // 2. ALLE Member hinzufügen - Ersteller + Ausgewählte
      const members = [
        { conversation_id: conversation.id, user_email: user.email },
       ...selectedMembers.map(email => ({
          conversation_id: conversation.id,
          user_email: email
        }))
      ];

      const { error: memberError } = await supabase
       .from("conversation_members")
       .insert(members);

      if (memberError) throw memberError;

      // 3. UI Update
      setShowCreateModal(false);
      setShowMemberModal(false);
      setNewGroup("");
      setSelectedMembers([]);
      setSelectedGroup(newGroup.trim());
      refreshGroups?.();

    } catch (err: any) {
      console.error("Gruppen-Erstellung fehlgeschlagen:", err);
      alert(`Fehler: ${err.message || "Unbekannter Fehler"}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 1:1 CHAT - CHECKT OB EXISTIERT
  const startPrivateChat = async (chatUser: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    // 1. Check ob 1:1 Chat schon existiert
    const { data: myMemberships } = await supabase
     .from("conversation_members")
     .select("conversation_id")
     .eq("user_email", user.email);

    if (myMemberships && myMemberships.length > 0) {
      const myConvIds = myMemberships.map(m => m.conversation_id);

      const { data: shared } = await supabase
       .from("conversation_members")
       .select("conversation_id, conversations!inner(is_group)")
       .eq("user_email", chatUser.email)
       .in("conversation_id", myConvIds)
       .eq("conversations.is_group", false)
       .maybeSingle();

      if (shared) {
        // Chat existiert -> öffnen
        const { data: conv } = await supabase
         .from("conversations")
         .select("name")
         .eq("id", shared.conversation_id)
         .single();

        if (conv) {
          setSelectedGroup(conv.name);
          return;
        }
      }
    }

    // 2. Neuen 1:1 Chat erstellen
    const privateGroupName = `${user.email.split('@')[0]} & ${chatUser.name || chatUser.email.split('@')[0]}`;

    const { data: conv, error } = await supabase
     .from("conversations")
     .insert({
        name: privateGroupName,
        is_group: false,
        created_by: user.email
      })
     .select()
     .single();

    if (error ||!conv) {
      alert("Chat konnte nicht erstellt werden");
      return;
    }

    // 3. BEIDE als Member - wichtig für Sichtbarkeit
    await supabase.from("conversation_members").insert([
      { conversation_id: conv.id, user_email: user.email },
      { conversation_id: conv.id, user_email: chatUser.email }
    ]);

    setSelectedGroup(privateGroupName);
    refreshGroups?.();
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
    return!groups.find(g => g.name === groupName && g.is_group);
  };

  const canDeleteChat = selectedGroup && (isAdmin || isPrivateChat(selectedGroup));

  const handleDeleteChat = () => {
    if (!canDeleteChat) return;
    setShowDeleteConfirm(selectedGroup);
  };

  const confirmDeleteChat = () => {
    if (showDeleteConfirm) {
      deleteChat?.(showDeleteConfirm);
      setSelectedGroup("");
      setShowDeleteConfirm(null);
    }
  };

  const handleDeleteGroup = (group: any) => {
    if (confirm(`Gruppe "${group.name}" + alle Nachrichten wirklich löschen?\n\nDSGVO: Diese Aktion ist unwiderruflich.`)) {
      deleteGroup(group.id);
      if (selectedGroup === group.name) {
        setSelectedGroup("");
      }
    }
  };

  const toggleMember = (email: string) => {
    setSelectedMembers(prev =>
      prev.includes(email)
       ? prev.filter(e => e!== email)
        : [...prev, email]
    );
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
              title="Neue Gruppe erstellen - Mitglieder auswählen"
            >
              +
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length > 0 && (
            <div className="py-2">
              <p className="px-3 py-1 text-xs font-semibold text-white/40 uppercase">
                Gruppen {isAdmin && "(Nur Admin kann erstellen)"}
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
                      <p className="text-xs text-white/40">Gruppenchat</p>
                    </div>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="mr-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition opacity-0 group-hover:opacity-100"
                      title="Gruppe + alle Nachrichten löschen"
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
                Person auswählen → Chat startet automatisch
              </p>
              {filteredUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => startPrivateChat(user)}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition"
                  title="Klicken um Chat zu starten - beide sehen die Nachrichten"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center text-[#0B1E3F] font-bold shrink-0">
                    {getInitials(user.email)}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-medium text-white text-sm truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-white/40">Klicken = Chat starten</p>
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
                ← Zurück
              </button>
              <div className="w-8 h-8 rounded-full bg-[#00D9FF]/20 flex items-center justify-center text-[#00D9FF] text-sm shrink-0">
                {isPrivateChat(selectedGroup)? "👤" : "#"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white truncate text-sm">
                  {selectedGroup}
                </h3>
                <p className="text-xs text-white/40">
                  {isPrivateChat(selectedGroup)
                   ? "Privat - nur ihr beide seht das"
                    : `${messages.length} Nachrichten - alle Mitglieder sehen das`}
                </p>
              </div>

              {canDeleteChat && (
                <button
                  onClick={handleDeleteChat}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 w-9 h-9 rounded-lg flex items-center justify-center text-lg active:scale-95 transition shrink-0"
                  title="Chat + alle Nachrichten löschen (DSGVO)"
                >
                  🗑
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.length === 0? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 opacity-10">💬</div>
                    <p className="text-white/30 text-sm">
                      {isPrivateChat(selectedGroup)
                       ? "Schreibe die erste Nachricht - nur ihr beide seht sie"
                        : "Schreibe die erste Nachricht - alle Gruppenmitglieder sehen sie"}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.user_email === currentUser?.email;
                  const showAvatar = idx === 0 || messages[idx - 1].user_email!== msg.user_email;
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
                              onClick={() => deleteMessage?.(msg.id)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded-lg text-xs transition shrink-0"
                              title="Nachricht löschen (DSGVO)"
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
                  placeholder={isPrivateChat(selectedGroup)
                   ? "Nachricht an diese Person..."
                    : "Nachricht an alle Gruppenmitglieder..."}
                  className="flex-1 bg-white/5 border-0 text-white px-4 py-2.5 rounded-xl outline-none focus:bg-white/10 placeholder:text-white/30 text-sm resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-[#00D9FF] disabled:opacity-30 disabled:cursor-not-allowed text-[#0B1E3F] w-10 h-10 rounded-xl flex items-center justify-center font-bold active:scale-95 transition shrink-0"
                  title="Senden - Empfänger sieht es sofort"
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
              <p className="text-white/30 text-sm mb-1">Wähle einen Chat aus</p>
              <p className="text-white/20 text-xs">Person anklicken = 1:1 Chat startet</p>
              <p className="text-white/20 text-xs">+ Button = Gruppe erstellen</p>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden mt-3 bg-[#00D9FF] text-[#0B1E3F] font-semibold px-5 py-2 rounded-lg text-sm"
              >
                Chats anzeigen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Gruppenname eingeben */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-[#0F2A52] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Schritt 1: Gruppenname</h3>
            <p className="text-white/60 text-xs mb-4">Wie soll die Gruppe heißen?</p>
            <input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && newGroup.trim() && setShowMemberModal(true)}
              placeholder="z.B. Mathe Klasse 5a"
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
                onClick={() => setShowMemberModal(true)}
                disabled={!newGroup.trim()}
                className="flex-1 bg-[#00D9FF] disabled:opacity-30 text-[#0B1E3F] py-2.5 rounded-xl font-semibold transition active:scale-95"
              >
                Weiter → Mitglieder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Mitglieder auswählen */}
      {showMemberModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {setShowMemberModal(false); setShowCreateModal(false);}}
        >
          <div
            className="bg-[#0F2A52] border border-white/10 rounded-2xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Schritt 2: Mitglieder wählen</h3>
            <p className="text-white/60 text-xs mb-4">
              Gruppe "{newGroup}" - Wer soll alles drin sein?
            </p>
            <p className="text-[#00D9FF] text-xs mb-3">
              ✓ Du bist automatisch dabei | Wähle weitere Personen
            </p>

            <div className="flex-1 overflow-y-auto mb-4 space-y-1">
              {chatUsers
               .filter(u => u.email!== currentUser?.email)
               .map(user => (
                  <button
                    key={user.email}
                    onClick={() => toggleMember(user.email)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg transition ${
                      selectedMembers.includes(user.email)
                       ? "bg-[#00D9FF]/20 border-[#00D9FF]"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedMembers.includes(user.email)
                       ? "bg-[#00D9FF] border-[#00D9FF]"
                        : "border-white/30"
                    }`}>
                      {selectedMembers.includes(user.email) && "✓"}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-white/40 text-xs">{user.email}</p>
                    </div>
                  </button>
                ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {setShowMemberModal(false);}}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-semibold transition"
              >
                Zurück
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={selectedMembers.length === 0 || isCreating}
                className="flex-1 bg-[#00D9FF] disabled:opacity-30 text-[#0B1E3F] py-2.5 rounded-xl font-semibold transition active:scale-95"
              >
                {isCreating? "Erstelle..." : `Gruppe erstellen (${selectedMembers.length + 1})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal für Chat löschen */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-[#0F2A52] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">Chat unwiderruflich löschen?</h3>
            <p className="text-white/60 text-sm mb-4">
              "{showDeleteConfirm}" und ALLE Nachrichten werden gelöscht.
            </p>
            <p className="text-yellow-400/80 text-xs mb-4">
              DSGVO: Diese Aktion kann nicht rückgängig gemacht werden.
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
                Ja, löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}