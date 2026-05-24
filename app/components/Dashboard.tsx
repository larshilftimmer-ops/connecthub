type Props = {
    user: any;
    logout: () => void;
    setActivePage: (page: string) => void;
  };
  
  export default function Dashboard({
    user,
    logout,
    setActivePage,
  }: Props) {
    return (
      <>
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/icon-192.png"
            alt="Logo"
            className="w-16 h-16 rounded-2xl"
          />
  
          <div>
            <h1 className="text-3xl font-bold">
              Freie Musikschule
            </h1>
  
            <p className="text-gray-400">
              Bad Soden e.V.
            </p>
          </div>
        </div>
  
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => setActivePage("profile")}
            className="bg-zinc-900 p-5 rounded-3xl text-left"
          >
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-bold">Profil</h3>
            <p className="text-gray-400 text-sm">
              Daten bearbeiten
            </p>
          </button>
  
          <button
            onClick={() => setActivePage("courses")}
            className="bg-zinc-900 p-5 rounded-3xl text-left"
          >
            <div className="text-3xl mb-2">🎵</div>
            <h3 className="font-bold">Kurse</h3>
            <p className="text-gray-400 text-sm">
              Musikkurse ansehen
            </p>
          </button>
  
          <button
            onClick={() => setActivePage("schedule")}
            className="bg-zinc-900 p-5 rounded-3xl text-left"
          >
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-bold">Stundenplan</h3>
            <p className="text-gray-400 text-sm">
              Unterricht & Termine
            </p>
          </button>
  
          <button
            onClick={() => setActivePage("instruments")}
            className="bg-zinc-900 p-5 rounded-3xl text-left"
          >
            <div className="text-3xl mb-2">🎹</div>
            <h3 className="font-bold">Instrumente</h3>
            <p className="text-gray-400 text-sm">
              Infos & Räume
            </p>
          </button>
        </div>
  
        <p className="text-gray-400 mt-6">
          {user.email}
        </p>
  
        <p className="text-green-400">
          Rolle: admin
        </p>
  
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded-xl mt-12"
        >
          Logout
        </button>
      </>
    );
  }