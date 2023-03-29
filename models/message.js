// setting up a model
const mongoose = require("mongoose"); //first import mongoose
const messageSchema = new mongoose.Schema({
  chatId: {
    type: String,
  },
  senderId: String,
  text: String,
},{
  timestamps: true,
});
module.exports = mongoose.model("Message", messageSchema);
