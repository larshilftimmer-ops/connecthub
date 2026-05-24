type Props = {
    user: any;
  };
  
  export default function ProfilePage({ user }: Props) {
    return (
      <section className="bg-zinc-900 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          Profil bearbeiten
        </h2>
  
        <p className="text-gray-400 mb-6">
          Hier kannst du später deine Daten verwalten.
        </p>
  
        <div className="space-y-4">
          <input
            placeholder="Name"
            className="w-full p-4 rounded-xl bg-zinc-800"
          />
  
          <input
            placeholder="Telefon"
            className="w-full p-4 rounded-xl bg-zinc-800"
          />
  
          <input
            placeholder="Instrument"
            className="w-full p-4 rounded-xl bg-zinc-800"
          />
  
          <input
            value={user.email}
            disabled
            className="w-full p-4 rounded-xl bg-zinc-800 text-gray-400"
          />
  
          <button className="w-full bg-blue-600 p-4 rounded-xl">
            Profil speichern
          </button>
        </div>
      </section>
    );
  }