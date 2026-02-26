import { useEffect, useRef, useState, useMemo } from "react";
import socket from "../socket/socket";
import axios from "axios";
import { getPrivateRoomId } from "../utils/getRoomId";
import { Send, Search } from "lucide-react";

const BASE = "http://localhost:5001";

export default function DirectMessages({ user }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");

  const [unread, setUnread] = useState({});
  const [lastMsg, setLastMsg] = useState({});

  const bottomRef = useRef(null);

  /* LOAD USERS */
  useEffect(() => {
    axios.get(`${BASE}/api/users`).then((res) => {
      setUsers(res.data.filter((u) => u._id !== user._id));
    });
  }, [user._id]);

  /* RESTORE ACTIVE CHAT */
  useEffect(() => {
    const saved = localStorage.getItem("activeDmUserId");
    if (!saved || !users.length) return;
    const found = users.find((u) => u._id === saved);
    if (found) setActiveUser(found);
  }, [users]);

  /* FILTER USERS */
  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  /* LOAD CHAT + JOIN ROOM */
  useEffect(() => {
    if (!activeUser) return;

    const roomId = getPrivateRoomId(user._id, activeUser._id);
    localStorage.setItem("activeDmUserId", activeUser._id);

    socket.emit("join", roomId);
    setUnread((p) => ({ ...p, [activeUser._id]: 0 }));

    axios
      .get(`${BASE}/api/messages/private/${user._id}/${activeUser._id}`)
      .then((res) => setMessages(res.data || []))
      .catch(() => setMessages([]));

    // seen when chat opens
    socket.emit("messageSeen", {
      roomId,
      senderId: activeUser._id,
      receiverId: user._id,
    });
  }, [activeUser, user._id]);

  /* SOCKET: RECEIVE MESSAGE (🔥 BUG FIX HERE) */
  useEffect(() => {
    const onReceive = (msg) => {
      const activeRoom =
        activeUser &&
        getPrivateRoomId(user._id, activeUser._id);

      const isActiveChat = msg.roomId === activeRoom;

      // ✅ ONLY active chat messages go to UI
      if (isActiveChat) {
        setMessages((prev) => [...prev, msg]);

        // instant seen if chat open
        if (msg.senderId !== user._id) {
          socket.emit("messageSeen", {
            roomId: msg.roomId,
            senderId: msg.senderId,
            receiverId: user._id,
          });
        }
      } else {
        // ❌ DO NOT push to messages
        setUnread((p) => ({
          ...p,
          [msg.senderId]: (p[msg.senderId] || 0) + 1,
        }));
      }

      // preview always updates
      setLastMsg((p) => ({
        ...p,
        [msg.senderId]: {
          content: msg.content,
          createdAt: msg.createdAt,
        },
      }));
    };

    socket.on("receiveMessage", onReceive);
    return () => socket.off("receiveMessage", onReceive);
  }, [activeUser, user._id]);

  /* SOCKET: SEEN CONFIRM */
  useEffect(() => {
    const onSeen = ({ seenAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user._id && m.status !== "seen"
            ? { ...m, status: "seen", seenAt }
            : m
        )
      );
    };

    socket.on("messagesSeen", onSeen);
    return () => socket.off("messagesSeen", onSeen);
  }, [user._id]);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SEND MESSAGE */
  const sendMessage = () => {
    if (!text.trim() || !activeUser) return;

    socket.emit("sendMessage", {
      roomId: getPrivateRoomId(user._id, activeUser._id),
      senderId: user._id,
      receiverId: activeUser._id,
      content: text,
      chatType: "private",
    });

    setText("");
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* LEFT USERS */}
      <div className="w-72 bg-white border-r p-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="flex-1 outline-none text-sm"
          />
        </div>

        {filteredUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => setActiveUser(u)}
            className={`flex justify-between px-3 py-2 rounded-lg cursor-pointer ${
              activeUser?._id === u._id
                ? "bg-indigo-100"
                : "hover:bg-gray-100"
            }`}
          >
            <div>
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {lastMsg[u._id]?.content || "No messages yet"}
              </div>
            </div>

            {unread[u._id] > 0 && (
              <div className="min-w-[20px] h-[20px] bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unread[u._id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeUser ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto bg-gray-50">
              {messages.map((m, i) => {
                const isMe = m.senderId === user._id;

                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${
                      isMe ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-indigo-600 text-white text-sm font-semibold">
  {(isMe ? user.avatar : activeUser.avatar) ? (
    <img
      src={`${BASE}${isMe ? user.avatar : activeUser.avatar}`}
      alt="avatar"
      className="h-full w-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  ) : (
    <span>
      {(isMe ? user.name : activeUser.name)[0]}
    </span>
  )}
</div>


                    <div className="max-w-[70%]">
                      <div
                        className={`text-xs text-gray-500 mb-1 ${
                          isMe ? "text-right" : ""
                        }`}
                      >
                        <span className="font-medium">
                          {isMe ? "You" : activeUser.name}
                        </span>{" "}
                        ·{" "}
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div
                        className={`px-4 py-2 rounded-2xl text-sm max-w-full break-words whitespace-pre-wrap ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-sm max-w-96"
                          : "bg-white border rounded-tl-sm"
                      }`}
                    >
                      {m.content}
                    </div>

                      {isMe &&
                        i === messages.length - 1 &&
                        m.status === "seen" && (
                          <div className="mt-1 flex justify-end">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            <div className="px-6 py-4 border-t">
              <div className="flex items-center gap-3 border rounded-xl px-4 py-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                  placeholder="Type message..."
                  className="flex-1 outline-none text-sm"
                />
                <button onClick={sendMessage} className="text-indigo-600">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
