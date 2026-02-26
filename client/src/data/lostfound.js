import axios from "axios";

const BASE = "https://campusconnect-90nf.onrender.com";

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchLostItems = () =>
  axios.get(`${BASE}/api/lostfound`);

export const createLostItem = (data, token) =>
  axios.post(
    `${BASE}/api/lostfound`,
    data,
    authHeader(token)
  );

export const resolveLostItem = (id, token) =>
  axios.patch(
    `${BASE}/api/lostfound/${id}/resolve`,
    {},
    authHeader(token)
  );

export const deleteLostItem = (id, token) =>
  axios.delete(
    `${BASE}/api/lostfound/${id}`,
    authHeader(token)
  );
