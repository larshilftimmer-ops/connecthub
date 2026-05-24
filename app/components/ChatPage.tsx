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
  }: Props) {
    return (
      <section className="space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl w-auto">
          <h2 className="text-2xl font-bold mb-4">
            Gruppen
          </h2>
  
          <div className="space-y-2 mb-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex gap-2"
              >
                <button
                  onClick={() =>
                    setSelectedGroup(group.name)
                  }
                  className={`flex-1 p-3 rounded-xl text-left ${
                    selectedGroup === group.name
                      ? "bg-blue-600"
                      : "bg-zinc-800"
                  }`}
                >
                  {group.name}
                </button>
  
                {isAdmin && (
                  <button
                    onClick={() =>
                      deleteGroup(group.id)
                    }
                    className="bg-red-600 px-3 rounded-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
  
          {isAdmin && (
            <div>
              <input
                value={newGroup}
                onChange={(e) =>
                  setNewGroup(e.target.value)
                }
                placeholder="Neue Gruppe"
                className="w-full p-3 rounded-xl bg-zinc-800 mb-3"
              />
  
              <button
                onClick={createGroup}
                className="w-full bg-green-600 p-3 rounded-xl"
              >
                Gruppe erstellen
              </button>
            </div>
          )}
        </div>
  
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6">
            {selectedGroup}
          </h2>
  
          <div className="flex flex-col gap-3 mb-6">
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Nachricht schreiben..."
              className="flex-1 p-4 rounded-xl bg-zinc-800"
            />
  
            <button
              onClick={sendMessage}
              className="bg-blue-600 py-3 rounded-xl w-full"
            >
              Senden
            </button>
          </div>
  
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-zinc-800 p-4 rounded-xl"
              >
                <p className="text-sm text-gray-400 mb-1">
                  {msg.user_email}
                </p>
  
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }