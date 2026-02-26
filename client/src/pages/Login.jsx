import { useState } from "react";
import { loginApi, signupApi } from "../api/auth";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({
    name: "",
    username: "",
    identifier: "",
    email: "",
    password: "",
    rollNo: "",
    branch: "",
    year: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");

    try {
      if (mode === "login") {
        const res = await loginApi({
          identifier: form.identifier,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        onLogin();
      } else {
        await signupApi({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
          rollNo: form.rollNo,
          branch: form.branch,
          year: form.year,
        });

        // after successful signup → go to login
        setMode("login");
        setForm({
          name: "",
          username: "",
          identifier: "",
          email: "",
          password: "",
          rollNo: "",
          branch: "",
          year: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl w-80 border">
        <h2 className="text-lg font-semibold mb-4">
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        {/* SIGNUP FIELDS */}
        {mode === "signup" && (
          <>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-2 text-sm"
            />

            <input
              name="username"
              placeholder="Username (unique)"
              value={form.username}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-2 text-sm"
            />

            <input
              name="email"
              placeholder="College Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-2 text-sm"
            />

            <input
              name="rollNo"
              placeholder="Roll No"
              value={form.rollNo}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-2 text-sm"
            />

            <input
              name="branch"
              placeholder="Branch (CSE)"
              value={form.branch}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-2 text-sm"
            />

            <input
              name="year"
              placeholder="Year (4)"
              value={form.year}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mb-2 text-sm"
            />
          </>
        )}

        {/* LOGIN FIELD */}
        {mode === "login" && (
          <input
            name="identifier"
            placeholder="Email or Username"
            value={form.identifier}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          />
        )}

        {/* PASSWORD */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded mb-3 text-sm"
        />

        {error && (
          <div className="text-xs text-red-500 mb-2">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-2 rounded text-sm"
        >
          {mode === "login" ? "Login" : "Signup"}
        </button>

        <div className="text-xs text-center mt-3">
          {mode === "login" ? (
            <span>
              New user?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-indigo-600"
              >
                Signup
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-indigo-600"
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
