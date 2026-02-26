import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import DirectMessages from "./pages/DirectMessages";
import GroupChats from "./pages/GroupChats";
import Announcements from "./pages/Announcements";
import LostFound from "./pages/LostFound";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import { getMeApi } from "./api/auth";
import socket from "./socket/socket";

export default function App() {
  // 🔥 RESTORE PAGE ON RELOAD
  const [page, setPage] = useState(
    () => localStorage.getItem("activePage") || "dm"
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= SAVE PAGE ================= */
  useEffect(() => {
    localStorage.setItem("activePage", page);
  }, [page]);

  /* ================= EXTERNAL DM OPEN ================= */
  useEffect(() => {
    const handler = () => {
      setPage("dm");
      localStorage.setItem("activePage", "dm");
    };

    window.addEventListener("open-dm", handler);
    return () =>
      window.removeEventListener("open-dm", handler);
  }, []);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMeApi(token)
      .then((res) => {
        setUser(res.data);

        socket.connect();
        socket.emit("join", res.data._id);
      })
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => socket.disconnect();
  }, []);

  if (loading)
    return <div className="p-10">Loading...</div>;

  if (!user)
    return <Login onLogin={() => window.location.reload()} />;

  const renderPage = () => {
    switch (page) {
      case "dm":
        return <DirectMessages user={user} />;
      case "groups":
        return <GroupChats user={user} />;
      case "announcements":
        return <Announcements />;
      case "lostfound":
        return <LostFound user={user} />;
      case "events":
        return <Events user={user} />;
      case "profile":
        return <Profile user={user} setUser={setUser} />;
      default:
        return <DirectMessages user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
      />

      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}
