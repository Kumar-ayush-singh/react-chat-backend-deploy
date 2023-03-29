const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const chat = require("../models/conversation");
const user = require("../models/user");
const consoleError = require("./showError");


//addding auth middleware
router.use(auth);


// new chat
router.post("/", async (req, res) => {

  console.log("\n\nRoute /chat/ :-");
  console.log(`\t>> Request Body >>>>`);
  console.log(req.body);



  
  try {
    //find is there any chat already present
    const chatWithSameMambers = await chat.find({
      $and: [
        {members: { $in: [req.body.senderId] }},
        {members: { $in: [req.body.receiverId] }}
      ]
    });

    console.log("find anything with this memebers ");
    console.log(chatWithSameMambers);
  
    //if not present
    if(chatWithSameMambers.length > 0){
      res.status(200).json(chatWithSameMambers[0]);
    }
    else{
      const newChat = new chat({
        members: [req.body.senderId, req.body.receiverId],
      });
      const savedChat = await newChat.save();
      res.status(200).json(savedChat);
    }
  } catch (error) {
    consoleError(error);
    res.status(500).json(error.message);
  }
});


router.get("/", (req, res) => {
  res.json({ msg: "working chat" });
});


// get user chats
router.get("/:userId", async (req, res) => {

  console.log("\n\nRoute /chat/:userId/ :-");
  console.log(`\t>> Request Parameters >>>>`);
  console.log(req.params);

  try {

    const allChats = await chat.find({
      // check members array inside
      members: { $in: [req.params.userId] },
      //is this id exsist in members if yes then return all the memeber array that include this id
    }).populate("lastMessage", "text senderId createdAt").populate("lastViewedMessage", "senderId").sort({updatedAt: -1});

    //modifying response to reduce handshaks
    const promiseOfAllChatsWithData = await allChats.map( async(singleChat) => {

      const singleChatJO = singleChat.toObject();

      const otherMemberId = ( singleChatJO.members[0] === req.params.userId ? singleChatJO.members[1] : singleChatJO.members[0]);
      singleChatJO.otherMember = await user.findById(otherMemberId).select("name avatar");

      delete singleChatJO.members;
      return singleChatJO;
    })
    
    const allChatsWithData = await Promise.all(promiseOfAllChatsWithData);
    console.log(allChatsWithData);

    res.status(200).json(allChatsWithData);
  } catch (error) {
    consoleError(error);
    res.status(500).json(error.message);
  }
});





module.exports = router;
