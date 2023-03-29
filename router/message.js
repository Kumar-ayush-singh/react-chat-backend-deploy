const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const Message = require("../models/message");
const consoleError = require("./showError");



//adding auth middleware
router.use(auth);



/**this in now handled by socket.io */

// add
// router.post("/", async (req, res) => {

//   console.log("\n\nRoute /message/ :-");
//   console.log(`\t>> Request Body >>>>`);
//   console.log(req.body);

//   const newMessage = new Message(req.body);

//   try {
//     const saveMessage = await newMessage.save();
//     res.status(200).json(saveMessage);

//     //now updating this at chat collection
//     const chat = await Conversation.findById(req.body.chatId);
//     chat.lastMessageId = saveMessage._id;
//     await chat.save();
//   } catch (error) {
//     consoleError(error);
//     res.status(500).json(error.message);
//   }

// });


// get
router.get("/:chatId", async (req, res) => {

  console.log("\n\nRoute /chat/:chatId :-");
  console.log(`\t>> Request Parameters >>>>`);
  console.log(req.params);

  const TR = (new Date()).getTime();

  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
    });

    const TAD = (new Date()).getTime();

    res.status(200).json({messages: messages, TR, TAD});
    
  } catch (err) {
    consoleError(err);
    res.status(500).json(err.message);
  }
});


module.exports = router;
