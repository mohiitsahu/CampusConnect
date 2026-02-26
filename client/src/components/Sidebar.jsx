import {
  MessageSquare,
  Users,
  Bell,
  Search,
  Calendar,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ page, setPage, user }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const item = (id, label, Icon) => (
    <div
      onClick={() => setPage(id)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-sm transition
        ${
          page === id
            ? "bg-indigo-100 text-indigo-700"
            : "hover:bg-gray-100 text-gray-700"
        }`}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
    </div>
  );

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-screen border-r p-4 flex flex-col bg-white transition-all duration-300`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h2 className="text-xl font-semibold">
            CampusConnect
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* MAIN NAV */}
      <div className="space-y-2">
        {item("dm", "Direct Messages", MessageSquare)}
        {item("groups", "Group Chats", Users)}
        {item("announcements", "Announcements", Bell)}
        {item("lostfound", "Lost & Found", Search)}
        {item("events", "Events", Calendar)}
      </div>

      {/* PROFILE SECTION */}
      <div className="mt-auto relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100"
        >
          <div className="flex items-center gap-3">
            {/* PROFILE ICON = INITIAL */}
            <div className="h-9 w-9 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
  {user?.avatar ? (
    <img
      src={`https://campusconnect-90nf.onrender.com${user.avatar}`}
      alt="avatar"
      className="h-full w-full object-cover"
    />
  ) : (
    user?.name?.[0]
  )}
</div>


            {/* NAME + UID */}
            {!collapsed && (
              <div>
                <div className="text-sm font-medium">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.rollNo}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <ChevronUp
              size={16}
              className={`transition ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {/* DROPDOWN */}
        {open && !collapsed && (
          <div className="absolute bottom-12 left-0 w-full bg-white border rounded-lg shadow-sm overflow-hidden">
            <div
              onClick={() => {
                setPage("profile");
                setOpen(false);
              }}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              My Profile
            </div>

            <div
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
