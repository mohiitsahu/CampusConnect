# 🎓 CampusConnect

A real-time campus communication platform for college students. Chat one-to-one, talk with your branch and year group, report lost and found items, and keep up with campus events, all in one place.

🔗 **Live Demo:** [campusconnect-1-1mcd.onrender.com](https://campusconnect-1-1mcd.onrender.com)

> ⚠️ The backend is hosted on Render's free tier, so the first request after a period of inactivity can take 30–60 seconds while the server wakes up.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Socket.io Events](#-socketio-events)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## ✨ Features

### 🔐 Authentication
- Sign up and log in with **email or username**
- Signup restricted to **college email addresses** (`@cuchd.in`)
- Passwords hashed with **bcrypt**, sessions handled with **JWT** (1-day expiry)
- Session restored automatically on page reload

### 💬 Direct Messages
- Real-time one-to-one chat powered by **Socket.io**
- Persistent chat history stored in MongoDB
- **Message status tracking:** sent → delivered → seen, with a seen timestamp

### 👥 Group Chats
- Users are **auto-added to a group** based on their branch and year at signup (for example `CSE-2022`)
- Real-time group messaging with stored history
- Server-side check so students can only post in their own branch-year group

### 📢 Announcements
- Tagged notices (Exam, Event, Notice) with colour-coded badges

### 🔎 Lost & Found
- Post **lost** or **found** items with description, location, and contact info
- Search and filter by type
- Owners can **mark items as resolved** or delete their posts

### 📅 Events
- Browse campus events by category: **Festival, Workshop, Placement, Cultural**
- Event detail pages with date, time, and location
- **Register / unregister** for events, with live attendee counts

### 👤 Profile
- Edit name and bio
- Upload or remove a profile picture (JPG/PNG)

### 🎨 UI
- Responsive, clean interface built with Tailwind CSS
- Collapsible sidebar navigation

---

## 🛠 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite, Tailwind CSS, Axios, Lucide React, Socket.io Client |
| **Backend** | Node.js, Express 5, Socket.io |
| **Database** | MongoDB with Mongoose |
| **Auth** | JSON Web Tokens, bcryptjs |
| **File Uploads** | Multer |
| **Deployment** | Render |

---

## 📁 Project Structure

```
CampusConnect/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios API helpers (auth, events, groups, lostfound, profile)
│       ├── components/         # Sidebar
│       ├── data/               # Static data (announcements)
│       ├── pages/              # DirectMessages, GroupChats, Announcements,
│       │                       # LostFound, Events, EventDetail, Profile, Login
│       ├── socket/             # Socket.io client instance
│       ├── utils/              # Helpers (room ID generation)
│       ├── App.jsx
│       └── main.jsx
│
└── server/                     # Express + Socket.io backend
    ├── models/                 # User, Group, Message, PrivateMessage, Event, LostItem
    ├── uploads/                # Profile pictures
    └── index.js                # Routes, auth middleware, socket handlers
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/CampusConnect.git
cd CampusConnect
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` (see [Environment Variables](#-environment-variables)), then start the server:

```bash
npm run dev
```

The server runs on **http://localhost:5001**.

### 3. Set up the frontend

```bash
cd client
npm install
```

The API and socket URLs are currently set to the deployed backend. To run against your local server, replace the base URL with `http://localhost:5001` in:

- `client/src/socket/socket.js`
- `client/src/api/*.js` (auth, events, groups, lostfound, profile)
- `client/src/components/Sidebar.jsx` and any page that loads avatar images

Then start the dev server:

```bash
npm run dev
```

The app runs on **http://localhost:5173**.

---

## 🔑 Environment Variables

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 📡 API Reference

Protected routes expect the JWT in a `token` request header.

### Auth
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Register a new user | ❌ |
| POST | `/api/auth/login` | Log in with email or username | ❌ |
| GET | `/api/me` | Get the current user | ✅ |

### Profile
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| PUT | `/api/profile` | Update name and bio | ✅ |
| PUT | `/api/profile/avatar` | Upload profile picture | ✅ |
| DELETE | `/api/profile/avatar` | Remove profile picture | ✅ |

### Groups & Messages
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/groups` | List all groups | ✅ |
| GET | `/api/groups/my` | Groups the current user belongs to | ✅ |
| GET | `/api/messages/group/:groupId` | Group chat history | ✅ |
| GET | `/api/messages/private/:user1/:user2` | Direct message history | ❌ |
| GET | `/api/users` | List users | ❌ |

### Lost & Found
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/lostfound` | List all items | ❌ |
| POST | `/api/lostfound` | Post an item | ✅ |
| PATCH | `/api/lostfound/:id/resolve` | Mark as resolved (owner only) | ✅ |
| DELETE | `/api/lostfound/:id` | Delete an item (owner only) | ✅ |

### Events
| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/events` | List all events | ✅ |
| GET | `/api/events/:id` | Get a single event | ✅ |
| POST | `/api/events` | Create an event | ✅ |
| POST | `/api/events/:id/register` | Register for an event | ✅ |
| POST | `/api/events/:id/unregister` | Unregister from an event | ✅ |
| PUT | `/api/events/:id` | Update an event | ✅ Admin |
| DELETE | `/api/events/:id` | Delete an event | ✅ |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
| --- | --- | --- |
| `join` | Client → Server | Join a room (user ID, group ID, or DM room) |
| `sendMessage` | Client → Server | Send a group or private message (`chatType: "group" \| "private"`) |
| `receiveMessage` | Server → Client | Broadcast a new message to the room |
| `messageSeen` | Client → Server | Mark messages in a DM as seen |
| `messagesSeen` | Server → Client | Notify the sender that messages were seen |

---

## 🗺 Roadmap

- [ ] Typing indicators
- [ ] Online / offline presence
- [ ] Image sharing in chats
- [ ] Admin dashboard for announcements and events
- [ ] Push notifications
- [ ] Move API base URLs to environment variables

---

## 👨‍💻 Author

**Mohit Sahu**

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-linkedin)

---

<p align="center">
  If you found this project useful, consider giving it a ⭐
</p>
