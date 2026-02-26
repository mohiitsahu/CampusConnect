import { useEffect, useState } from "react";
import socket from "../socket/socket";
import axios from "axios";
import { Users } from "lucide-react";

const BASE = "http://localhost:5001";

export default function GroupChats({ user }) {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  const token = localStorage.getItem("token");
  const myGroupName = `${user.branch}-${user.year}`.toUpperCase();
  const canSend = activeGroup?.name === myGroupName;

  /* LOAD GROUPS */
  useEffect(() => {
    axios
      .get(`${BASE}/api/groups`, { headers: { token } })
      .then((res) => setGroups(res.data))
      .catch(() => setGroups([]));
  }, []);

  /* JOIN + LOAD MESSAGES */
  useEffect(() => {
    if (!activeGroup) return;

    socket.emit("join", activeGroup._id);

    axios
      .get(`${BASE}/api/messages/group/${activeGroup._id}`, {
        headers: { token },
      })
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));

    socket.on("receiveMessage", (msg) => {
      if (msg.roomId === activeGroup._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [activeGroup]);

  /* SEND MESSAGE */
  const sendMessage = () => {
    if (!text.trim() || !canSend) return;

    socket.emit("sendMessage", {
      roomId: activeGroup._id,
      senderId: user._id,
      content: text,
      chatType: "group",
    });

    setText("");
  };

  return (
    <div className="flex h-full">
      {/* LEFT — GROUP LIST */}
      <div className="w-64 border-r p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3">All Groups</h3>

        {groups.map((g) => (
          <div
            key={g._id}
            onClick={() => {
              setActiveGroup(g);
              setShowMembers(false);
            }}
            className={`p-2 rounded cursor-pointer mb-1 ${
              activeGroup?._id === g._id
                ? "bg-indigo-100"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="font-medium">{g.name}</div>
            <div className="text-xs text-gray-500">
              {g.members.length} members
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT — CHAT */}
      <div className="flex-1 flex flex-col p-4">
        {!activeGroup ? (
          <div className="text-gray-500">
            Select a group to view chat
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="border-b pb-2 mb-2 flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {activeGroup.name}
                </div>
                {!canSend && (
                  <div className="text-xs text-red-500">
                    Read only — chat allowed only in your
                    year group
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  setShowMembers(!showMembers)
                }
                className="flex items-center gap-1 text-sm text-indigo-600"
              >
                <Users size={16} />
                Members
              </button>
            </div>

            {/* MEMBERS PANEL */}
            {showMembers && (
              <div className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="text-sm font-semibold mb-2">
                  Group Members
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {activeGroup.members.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center gap-2 bg-white border rounded px-2 py-1"
                    >
                      <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                        {m.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-medium">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          @{m.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded max-w-xs text-sm ${
                    m.senderId === user._id
                      ? "ml-auto bg-indigo-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div className="flex gap-2 mt-3">
              <input
                value={text}
                disabled={!canSend}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 border px-3 py-2 rounded disabled:bg-gray-100"
                placeholder={
                  canSend
                    ? "Type message..."
                    : "Read only"
                }
              />

              <button
                disabled={!canSend}
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-4 rounded disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
