// setting up a model
const mongoose = require("mongoose"); //first import mongoose
const chatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    lastMessage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Message",
    },
    lastViewedMessage: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Message",
    },
    unreadMsgCount: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Chat", chatSchema);
