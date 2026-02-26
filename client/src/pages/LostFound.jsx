import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Clock,
  Trash2,
  CheckCircle,
  Filter,
  PackageSearch,
} from "lucide-react";
import {
  fetchLostItems,
  createLostItem,
  resolveLostItem,
  deleteLostItem,
} from "../api/lostfound";

export default function LostFound({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    contact: "",
    type: "lost",
  });

  const token = localStorage.getItem("token");

  const loadItems = async () => {
    setLoading(true);
    const res = await fetchLostItems();
    setItems(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  /* FILTER + SEARCH */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (tab === "lost" && item.isResolved) return false;
      if (tab === "found" && !item.isResolved) return false;

      if (
        search &&
        !(
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      )
        return false;

      return true;
    });
  }, [items, tab, search]);

  const handlePost = async () => {
    if (!token) return alert("Login required");

    await createLostItem(
      { ...form, isResolved: form.type === "found" },
      token
    );

    setShowForm(false);
    setForm({
      title: "",
      description: "",
      location: "",
      contact: "",
      type: "lost",
    });

    loadItems();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await deleteLostItem(id, token);
    loadItems();
  };

  const handleResolve = async (id) => {
    await resolveLostItem(id, token);
    loadItems();
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Lost & Found</h1>
          <p className="text-sm text-gray-500">
            Help find lost items
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700"
        >
          + Post Item
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border rounded-xl pl-10 pr-4 py-2 text-sm"
          />
        </div>
        <button className="bg-white border rounded-xl p-2">
          <Filter className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {[
          { key: "all", label: "All Items" },
          { key: "lost", label: "Lost" },
          { key: "found", label: "Found" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-full font-medium ${
              tab === t.key
                ? "bg-white border shadow-sm"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {!loading &&
          filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-5 flex gap-4 items-start shadow-sm"
            >
              {/* ICON */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  item.isResolved
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <PackageSearch className="w-6 h-6" />
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      item.isResolved
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isResolved ? "FOUND" : "LOST"}
                  </span>
                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600">
                  {item.description}
                </p>

                <div className="flex gap-4 text-xs text-gray-500 mt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div
  className={`text-sm mt-2 ${
    user && item.createdBy._id === user._id
      ? "text-gray-400 cursor-not-allowed"
      : "text-indigo-600 cursor-pointer hover:underline"
  }`}
  onClick={() => {
    // prevent self chat
    if (!user || item.createdBy._id === user._id) return;

    // store target user for DM
    localStorage.setItem(
      "dmUserId",
      item.createdBy._id
    );

    // go to DM page
    window.dispatchEvent(
      new CustomEvent("open-dm")
    );
  }}
>
  Contact: @{item.createdBy.username}
</div>

              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-3">
                {!item.isResolved && (
                  <button
                    title="Mark Found"
                    onClick={() => handleResolve(item._id)}
                    className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}

                <button
                  title="Delete"
                  onClick={() => handleDelete(item._id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-14 text-gray-500">
            <PackageSearch className="w-10 h-10 mx-auto mb-3" />
            <p className="font-medium">No items found</p>
            <p className="text-sm">
              Try changing filters or posting a new item
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 space-y-4">
            <h2 className="font-semibold text-lg">
              Post Item
            </h2>

            <select
              className="w-full border rounded-lg px-3 py-2"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>

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

            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Contact"
              value={form.contact}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                onClick={handlePost}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
