import { useState } from "react";
import {
  Pencil,
  X,
  Save,
  Camera,
  Trash2,
} from "lucide-react";
import {
  updateProfile,
  updateAvatar,
  removeAvatar,
} from "../api/profile";

export default function Profile({ user, setUser }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  /* ---------------- AVATAR UPLOAD ---------------- */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await updateAvatar(file, token);
      setUser(res.data); // update everywhere
    } catch {
      alert("Avatar upload failed");
    }
  };

  /* ---------------- AVATAR REMOVE ---------------- */
  const handleRemoveAvatar = async () => {
    if (!window.confirm("Remove profile photo?")) return;

    try {
      const res = await removeAvatar(token);
      setUser(res.data); // update everywhere
    } catch {
      alert("Failed to remove avatar");
    }
  };

  /* ---------------- PROFILE SAVE ---------------- */
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateProfile(
        { name, bio },
        token
      );
      setUser(res.data);
      setEdit(false);
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setBio(user.bio || "");
    setEdit(false);
  };

  return (
    <div className="p-6 max-w-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          My Profile
        </h2>

        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:underline"
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-500 text-sm hover:underline"
          >
            <X size={16} />
            Cancel
          </button>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-6">
        {/* AVATAR + NAME */}
        <div className="flex items-center gap-5">
          {/* AVATAR */}
          <div className="relative">
            {user.avatar ? (
              <img
                src={`https://campusconnect-90nf.onrender.com${user.avatar}`}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-semibold">
                {user.name[0]}
              </div>
            )}

            {/* UPLOAD */}
            <label className="absolute bottom-0 right-0 bg-white border rounded-full p-1 cursor-pointer shadow">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </label>

            {/* REMOVE */}
            {user.avatar && (
              <button
                onClick={handleRemoveAvatar}
                title="Remove photo"
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* NAME */}
          <div className="flex-1">
            {edit ? (
              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="border px-3 py-2 rounded w-full text-sm"
              />
            ) : (
              <>
                <div className="text-lg font-semibold">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500">
                  @{user.username}
                </div>
              </>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div className="text-sm space-y-2">
          <div>
            <span className="text-gray-500">
              College UID:
            </span>{" "}
            {user.rollNo}
          </div>
          <div>
            <span className="text-gray-500">
              Branch:
            </span>{" "}
            {user.branch}
          </div>
          <div>
            <span className="text-gray-500">
              Year:
            </span>{" "}
            {user.year}
          </div>
        </div>

        {/* BIO */}
        <div>
          <div className="text-sm text-gray-500 mb-1">
            Bio
          </div>
          {edit ? (
            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              rows={3}
              className="border px-3 py-2 rounded w-full text-sm"
            />
          ) : (
            <div className="text-sm text-gray-700 italic">
              {user.bio || "No bio added"}
            </div>
          )}
        </div>

        {/* SAVE */}
        {edit && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
