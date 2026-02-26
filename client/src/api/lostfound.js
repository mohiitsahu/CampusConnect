import axios from "axios";

const BASE = "https://campusconnect-90nf.onrender.com";

const auth = (token) => ({
  headers: {
    token: token, // backend expects req.headers.token
  },
});

export const fetchLostItems = () =>
  axios.get(`${BASE}/api/lostfound`);

export const createLostItem = (data, token) =>
  axios.post(`${BASE}/api/lostfound`, data, auth(token));

export const resolveLostItem = (id, token) =>
  axios.patch(`${BASE}/api/lostfound/${id}/resolve`, {}, auth(token));

export const deleteLostItem = (id, token) =>
  axios.delete(`${BASE}/api/lostfound/${id}`, auth(token));
