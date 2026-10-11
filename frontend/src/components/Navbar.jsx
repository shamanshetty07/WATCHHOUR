import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0f0f0f]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="rounded bg-red-600 px-2 py-1 text-sm">▶</span>
          WatchHour
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/upload"
                className="rounded-full bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
              >
                Upload
              </Link>
              <Link
                to={`/channel/${user.username}`}
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1.5 hover:bg-zinc-700"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden text-sm sm:inline">{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
