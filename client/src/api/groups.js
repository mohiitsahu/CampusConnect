import axios from "axios";
const BASE = "https://campusconnect-90nf.onrender.com";

export const getAllGroupsApi = (token) =>
  axios.get(`${BASE}/api/groups`, {
    headers: { token },
  });

export const getMyGroupsApi = (token) =>
  axios.get(`${BASE}/api/groups/my`, {
    headers: { token },
  });
