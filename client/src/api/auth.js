import axios from "axios";

const BASE = "http://localhost:5001";

export const loginApi = (data) =>
  axios.post(`${BASE}/api/auth/login`, data);

export const signupApi = (data) =>
  axios.post(`${BASE}/api/auth/signup`, data);

export const getMeApi = (token) =>
  axios.get(`${BASE}/api/me`, {
    headers: { token },
  });
