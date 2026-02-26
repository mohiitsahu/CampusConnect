const mongoose = require("mongoose");

const LostItemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    contact: String,

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },

    isResolved: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostItem", LostItemSchema);
