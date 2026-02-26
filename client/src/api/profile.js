import axios from "axios";
const BASE = "https://campusconnect-90nf.onrender.com";

export const updateProfile = (data, token) =>
  axios.put(`${BASE}/api/profile`, data, {
    headers: { token },
  });

export const updateAvatar = (file, token) => {
  const fd = new FormData();
  fd.append("avatar", file);

  return axios.put(`${BASE}/api/profile/avatar`, fd, {
    headers: { token },
  });
};

// 🔴 MISSING PART (ADD THIS)
export const removeAvatar = (token) =>
  axios.delete(`${BASE}/api/profile/avatar`, {
    headers: { token },
  });
