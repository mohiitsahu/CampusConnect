import axios from "axios";

const BASE = "https://campusconnect-90nf.onrender.com";

export const fetchEvents = (token) =>
  axios.get(`${BASE}/api/events`, {
    headers: { token },
  });

export const createEvent = (data, token) =>
  axios.post(`${BASE}/api/events`, data, {
    headers: { token },
  });

export const fetchEventById = (id, token) =>
  axios.get(`${BASE}/api/events/${id}`, {
    headers: { token },
  });

export const registerEvent = (id, token) =>
  axios.post(
    `${BASE}/api/events/${id}/register`,
    {},
    { headers: { token } }
  );

  export const deleteEvent = (id, token) =>
  axios.delete(`${BASE}/api/events/${id}`, {
    headers: { token },
  });

export const updateEvent = (id, data, token) =>
  axios.put(`${BASE}/api/events/${id}`, data, {
    headers: { token },
  });

export const unregisterEvent = (id, token) =>
  axios.post(
    `${BASE}/api/events/${id}/unregister`,
    {},
    { headers: { token } }
  );

