const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  avatar: {
    type: String, // image URL
    default: "",
  },

  bio: {
   type: String,
    default: "",
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  
  rollNo: String,
  branch: String,
  year: String,
  password: String,
});

module.exports = mongoose.model("User", UserSchema);
