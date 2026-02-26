const mongoose = require("mongoose");

const PrivateMessageSchema = new mongoose.Schema(
  {
    roomId: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: String,

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    seenAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PrivateMessage",
  PrivateMessageSchema
);
