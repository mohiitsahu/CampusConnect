import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Trash2,
  XCircle,
  X,
  Search,
} from "lucide-react";
import {
  fetchEvents,
  registerEvent,
  unregisterEvent,
  deleteEvent,
  createEvent,
} from "../api/events";

const CATEGORIES = ["All", "Festival", "Workshop", "Placement", "Cultural"];

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Festival",
    startDate: "",
    endDate: "",
    time: "",
    location: "",
  });

  const token = localStorage.getItem("token");

  const loadEvents = async () => {
    const res = await fetchEvents(token);
    setEvents(res.data || []);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (
        search &&
        !(
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;

      if (category !== "All" && e.category !== category) return false;

      return true;
    });
  }, [events, search, category]);

  const badgeColor = (category) => {
    switch (category) {
      case "Festival":
        return "bg-purple-100 text-purple-700";
      case "Workshop":
        return "bg-green-100 text-green-700";
      case "Placement":
        return "bg-blue-100 text-blue-700";
      case "Cultural":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleRegister = async (id) => {
    await registerEvent(id, token);
    loadEvents();
  };

  const handleUnregister = async (id) => {
    if (!confirm("Unregister from this event?")) return;
    await unregisterEvent(id, token);
    loadEvents();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id, token);
    loadEvents();
  };

  const handleCreate = async () => {
    if (!form.title || !form.startDate || !form.time)
      return alert("Fill required fields");

    await createEvent(form, token);
    setShowModal(false);
    setForm({
      title: "",
      description: "",
      category: "Festival",
      startDate: "",
      endDate: "",
      time: "",
      location: "",
    });
    loadEvents();
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-xl">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Events</h1>
            <p className="text-sm text-gray-500">
              Upcoming college events
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
        >
          + Create Event
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            className="w-full outline-none text-sm"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm ${
                category === c
                  ? "bg-indigo-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-5">
        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-2xl p-5 flex gap-5 items-center shadow-sm"
          >
            {/* DATE */}
            <div className="w-24 h-24 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white rounded-xl flex flex-col items-center justify-center font-bold">
              <span>
                {new Date(event.startDate).getDate()}–
                {new Date(event.endDate).getDate()}
              </span>
              <span className="text-sm">
                {new Date(event.startDate).toLocaleString("en", {
                  month: "short",
                })}
              </span>
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeColor(
                    event.category
                  )}`}
                >
                  {event.category}
                </span>

                {event.isRegistered && (
                  <span className="text-xs px-3 py-1 rounded-full border border-green-500 text-green-600 font-semibold">
                    Registered
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-lg">
                {event.title}
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                {event.description}
              </p>

              <div className="flex gap-5 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.attendeesCount} attending
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 mt-3">
                {!event.isRegistered ? (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="text-indigo-600 text-sm font-medium"
                  >
                    Register
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnregister(event._id)}
                    className="text-red-500 text-sm font-medium flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Unregister
                  </button>
                )}

                <button
                  onClick={() => handleDelete(event._id)}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No events found
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                Create Event
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <select
              className="w-full border rounded-lg px-3 py-2"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            >
              <option>Festival</option>
              <option>Workshop</option>
              <option>Placement</option>
              <option>Cultural</option>
            </select>

            <div className="flex gap-3">
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.startDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startDate: e.target.value,
                  })
                }
              />
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.endDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    endDate: e.target.value,
                  })
                }
              />
            </div>

            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Time (e.g. 10:00 AM - 2:00 PM)"
              value={form.time}
              onChange={(e) =>
                setForm({ ...form, time: e.target.value })
              }
            />

            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Create 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
