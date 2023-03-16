const mongoose = require("mongoose"); //first import mongoose
const onlineSchema = new mongoose.Schema(
  {
    online: {
      type: Array,
      //   default: [],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Online", onlineSchema);
