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
  messages: any[];
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
  return (
    <section className="w-full max-w-full overflow-x-hidden space-y-6 text-zinc-900">
      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <p className="text-sm font-semibold text-[#d8a928] mb-2">
          Austausch
        </p>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#7a1f1f]">
          Chat
        </h2>

        <p className="text-zinc-500 mt-2">
          Gruppen und Nachrichten.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <h3 className="text-xl font-bold text-[#7a1f1f] mb-4">
          Personen
        </h3>

        <div className="space-y-3">
          {chatUsers
            .filter((chatUser) => chatUser.email !== currentUser?.email)
            .map((chatUser) => {
              const emails = [
                currentUser?.email,
                chatUser.email,
              ].sort();

              const privateGroupName = `Privat: ${emails[0]} ↔ ${emails[1]}`;

              return (
                <button
                  key={chatUser.email}
                  onClick={() => {
                    setSelectedGroup(privateGroupName);
                    setNewGroup(privateGroupName);
                    createGroup();
                  }}
                  className="w-full bg-[#f7f3ea] border border-zinc-200 p-4 rounded-2xl text-left"
                >
                  <p className="font-bold text-zinc-900 break-words">
                    {chatUser.name || chatUser.email}
                  </p>

                  <p className="text-sm text-zinc-500 break-all">
                    {chatUser.email}
                  </p>
                </button>
              );
            })}
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <h3 className="text-xl font-bold text-[#7a1f1f] mb-4">
          Gruppen
        </h3>

        <div className="space-y-3 mb-6">
          {groups.length === 0 ? (
            <p className="text-zinc-500">
              Keine Gruppen vorhanden.
            </p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="flex gap-2"
              >
                <button
                  onClick={() => setSelectedGroup(group.name)}
                  className={`flex-1 min-w-0 p-4 rounded-2xl text-left border transition ${
                    selectedGroup === group.name
                      ? "bg-[#7a1f1f] text-white border-[#7a1f1f]"
                      : "bg-[#f7f3ea] text-zinc-900 border-zinc-200"
                  }`}
                >
                  <span className="block font-semibold break-words">
                    {group.name}
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="bg-red-600 text-white px-4 rounded-2xl font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bg-[#f7f3ea] border border-zinc-200 rounded-2xl p-4">
          <input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="Neue Gruppe"
            className="w-full p-4 rounded-xl bg-white border border-zinc-200 mb-3 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <button
            onClick={createGroup}
            className="w-full bg-[#7a1f1f] hover:bg-[#651919] transition text-white font-semibold p-4 rounded-xl"
          >
            Gruppe erstellen
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-[#7a1f1f] mb-4 break-words">
          {selectedGroup}
        </h3>

        <div className="bg-[#f7f3ea] border border-zinc-200 rounded-2xl p-4 mb-6">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            className="w-full p-4 rounded-xl bg-white border border-zinc-200 mb-3 outline-none focus:ring-2 focus:ring-[#d8a928]"
          />

          <button
            onClick={sendMessage}
            className="w-full bg-[#7a1f1f] hover:bg-[#651919] transition text-white font-semibold p-4 rounded-xl"
          >
            Senden
          </button>
        </div>

        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-zinc-500">
              Noch keine Nachrichten vorhanden.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-[#f7f3ea] border border-zinc-200 p-4 rounded-2xl overflow-hidden"
              >
                <p className="text-sm text-[#7a1f1f] font-semibold mb-2 break-all">
                  {msg.user_email}
                </p>

                <p className="text-zinc-800 break-words leading-7">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}