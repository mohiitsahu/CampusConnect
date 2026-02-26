import axios from "axios";
const BASE = "http://localhost:5001";

export const getAllGroupsApi = (token) =>
  axios.get(`${BASE}/api/groups`, {
    headers: { token },
  });

export const getMyGroupsApi = (token) =>
  axios.get(`${BASE}/api/groups/my`, {
    headers: { token },
  });
