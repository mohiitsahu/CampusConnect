const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config();
const LostItem = require("./models/LostItem");
const Group = require("./models/Group");
const Event = require("./models/Event");
const User = require("./models/User");
const Message = require("./models/Message");
const app = express();
const server = http.createServer(app);
const multer = require("multer");
const path = require("path");
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


/* =======================
   DATABASE CONNECTION
======================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

/* =======================
   AUTH MIDDLEWARE
======================= */
const authMiddleware = (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

const adminOnly = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ msg: "Admin only" });
  }
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/PNG allowed"));
    }
  },
});


/* =======================
   AUTH APIs
======================= */

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, username, email, rollNo, branch, year, password } = req.body;

    if (!email.endsWith("@cuchd.in")) {
      return res.status(400).json({ msg: "Only college email allowed" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      rollNo,
      branch,
      year,
      password: hashedPassword,
    });

    await user.save();

    // 🔥 AUTO GROUP JOIN (CRITICAL)
    const groupName = `${branch}-${year}`.toUpperCase();

    let group = await Group.findOne({ name: groupName });

    if (!group) {
      group = new Group({
        name: groupName,
        members: [user._id],
      });
    } else {
      if (!group.members.includes(user._id)) {
        group.members.push(user._id);
      }
    }

    await group.save();

    console.log("✅ User added to group:", groupName);

    res.json({ msg: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Signup failed" });
  }
});


// GET MY GROUPS

app.get("/api/groups/my", authMiddleware, async (req, res) => {
  const groups = await Group.find({
    members: req.userId,
  });

  res.json(groups);
});


// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // identifier = email OR username
    const query = identifier.includes("@")
      ? { email: identifier }
      : { username: identifier };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        branch: user.branch,
        year: user.year,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Login failed" });
  }
});


/* =======================
   PROTECTED TEST API
======================= */
app.get("/api/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

// GET CHAT HISTORY (GROUP)
app.get("/api/messages/group/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({
      receiverId: roomId,
      type: "group"
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load messages" });
  }
});

// GET GROUP CHAT HISTORY
app.get(
  "/api/messages/group/:groupId",
  authMiddleware,
  async (req, res) => {
    const messages = await Message.find({
      roomId: req.params.groupId,
      type: "group",
    })
      .populate("senderId", "name username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  }
);

app.get("/api/groups", authMiddleware, async (req, res) => {
  const groups = await Group.find().populate(
    "members",
    "name username"
  );
  res.json(groups);
});


// GET PRIVATE CHAT HISTORY
app.get(
  "/api/messages/private/:user1/:user2",
  async (req, res) => {
    try {
      const { user1, user2 } = req.params;

      // 🔥 SAME ROOM ID LOGIC AS FRONTEND
      const roomId =
        user1 < user2
          ? `${user1}_${user2}`
          : `${user2}_${user1}`;

      const messages = await PrivateMessage.find({
        roomId,
      })
        .sort({ createdAt: 1 });

      res.json(messages);
    } catch (err) {
      console.error("FETCH DM ERROR:", err);
      res.status(500).json([]);
    }
  }
);

//Lost Items APIs

app.post("/api/lostfound", authMiddleware, async (req, res) => {
  try {
    const item = new LostItem({
      ...req.body,
      createdBy: req.userId,
    });

    await item.save();
    res.json(item);
  } catch {
    res.status(500).json({ msg: "Failed to create item" });
  }
});


app.get("/api/lostfound", async (req, res) => {
  const items = await LostItem.find()
    .sort({ createdAt: -1 })
    .populate("createdBy", "username");

  res.json(items);
});

app.patch(
  "/api/lostfound/:id/resolve",
  authMiddleware,
  async (req, res) => {
    const item = await LostItem.findById(req.params.id);

    if (!item)
      return res.status(404).json({ msg: "Item not found" });

    if (item.createdBy.toString() !== req.userId)
      return res.status(403).json({ msg: "Not allowed" });

    item.isResolved = true;
    await item.save();

    res.json(item);
  }
);

app.delete(
  "/api/lostfound/:id",
  authMiddleware,
  async (req, res) => {
    const item = await LostItem.findById(req.params.id);

    if (!item)
      return res.status(404).json({ msg: "Item not found" });

    if (item.createdBy.toString() !== req.userId)
      return res.status(403).json({ msg: "Not allowed" });

    await item.deleteOne();
    res.json({ msg: "Item deleted" });
  }
);

/* =======================
   EVENTS APIs
======================= */

// GET ALL EVENTS
app.get("/api/events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1 });

    const formatted = events.map((event) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: event.startDate,
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      attendeesCount: event.attendees.length,
      isRegistered: event.attendees.includes(req.userId),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch events" });
  }
});

// CREATE EVENT
app.post("/api/events", authMiddleware, async (req, res) => {
  try {
    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      time: req.body.time,
      location: req.body.location,
      attendees: [],
    });

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create event" });
  }
});

// REGISTER EVENT
app.post(
  "/api/events/:id/register",
  authMiddleware,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event)
        return res.status(404).json({ msg: "Event not found" });

      if (event.attendees.includes(req.userId)) {
        return res
          .status(400)
          .json({ msg: "Already registered" });
      }

      event.attendees.push(req.userId);
      await event.save();

      res.json({ msg: "Registered successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Registration failed" });
    }
  }
);

// UNREGISTER EVENT
app.post(
  "/api/events/:id/unregister",
  authMiddleware,
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event)
        return res.status(404).json({ msg: "Event not found" });

      event.attendees = event.attendees.filter(
        (uid) => uid.toString() !== req.userId
      );

      await event.save();
      res.json({ msg: "Unregistered successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Unregister failed" });
    }
  }
);


// GET SINGLE EVENT
app.get("/api/events/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ msg: "Event not found" });

    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: event.startDate,
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      attendeesCount: event.attendees.length,
      isRegistered: event.attendees.includes(req.userId),
    });
  } catch {
    res.status(500).json({ msg: "Failed to load event" });
  }
});

// DELETE EVENT (ADMIN)
app.delete(
  "/api/events/:id",
  authMiddleware,
  async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.id);
      res.json({ msg: "Event deleted" });
    } catch {
      res.status(500).json({ msg: "Delete failed" });
    }
  }
);

// UPDATE EVENT (ADMIN)
app.put(
  "/api/events/:id",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const updated = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.json(updated);
    } catch {
      res.status(500).json({ msg: "Update failed" });
    }
  }
);


// GET USERS (same college)
app.get("/api/users", async (req, res) => {
  const users = await User.find().select("_id name branch year");
  res.json(users);
});


// UPDATE PROFILE
app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updatedUser = await User.findById(req.userId).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: "Profile update failed" });
  }
});

app.put("/api/profile", authMiddleware, async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updatedUser = await User.findById(req.userId).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ msg: "Profile update failed" });
  }
});

app.put(
  "/api/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const user = await User.findById(req.userId);
      user.avatar = `/uploads/${req.file.filename}`;
      await user.save();

      const updatedUser = await User.findById(req.userId).select("-password");
      res.json(updatedUser);
    } catch (err) {
      console.error("AVATAR UPLOAD ERROR:", err);
      res.status(500).json({ msg: "Avatar upload failed" });
    }
  }
);

// REMOVE AVATAR
app.delete(
  "/api/profile/avatar",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.avatar = "";
      await user.save();

      const updatedUser = await User.findById(req.userId).select("-password");
      res.json(updatedUser);
    } catch (err) {
      console.error("AVATAR REMOVE ERROR:", err);
      res.status(500).json({ msg: "Failed to remove avatar" });
    }
  }
);


/* =======================
   SOCKET.IO CHAT
======================= */
const PrivateMessage = require("./models/PrivateMessage");

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { roomId, senderId, receiverId, content, chatType } = data;

      if (!content || !senderId) return;

      // GROUP CHAT
      if (chatType === "group") {
        const user = await User.findById(senderId);
        const group = await Group.findById(roomId);
        if (!user || !group) return;

        const allowedGroup =
          `${user.branch}-${user.year}`.toUpperCase();
        if (group.name !== allowedGroup) return;

        const msg = new Message({
          roomId,
          senderId,
          content,
        });

        await msg.save();

        io.to(roomId.toString()).emit("receiveMessage", {
          roomId,
          senderId,
          content,
          createdAt: msg.createdAt,
        });
      }

      // PRIVATE CHAT
      if (chatType === "private") {
        const msg = new PrivateMessage({
          roomId,
          senderId,
          receiverId,
          content,
        });

        await msg.save();

        io.to(roomId).emit("receiveMessage", {
          roomId,
          senderId,
          receiverId,
          content,
          createdAt: msg.createdAt,
        });
      }
    } catch (err) {
      console.error("SOCKET ERROR:", err);
    }
  });

  // 🔥 NEW: SEEN HANDLER
  socket.on(
    "messageSeen",
    async ({ roomId, senderId, receiverId }) => {
      try {
        const now = new Date();

        await PrivateMessage.updateMany(
          {
            roomId,
            senderId,
            receiverId,
            status: { $ne: "seen" },
          },
          {
            status: "seen",
            seenAt: now,
          }
        );

        // notify sender
        io.to(roomId).emit("messagesSeen", {
          roomId,
          senderId,
          seenAt: now,
        });
      } catch (err) {
        console.error("SEEN ERROR:", err);
      }
    }
  );
});


/* =======================
   SERVER START
======================= */
const PORT = 5001;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
