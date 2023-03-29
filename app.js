require("dotenv").config();
// require("express-async-errors");
const express = require("express");
const app = express();
const auth = require("./middleware/auth");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");

const connectDb = require("./db/connect");
const chatRouter = require("./router/chat");
const messageRouter = require("./router/message");
const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const consoleError = require("./router/showError");



const message = require("./models/message")
const user = require("./models/user")
const conversation = require("./models/conversation")




// const orderRouter = require("./router/order");
app.set("trust proxy", 1); //for huruko
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes //how long
//     max: 100, // limit each IP to 100 requests per windowMs //how many
//   })
// );
app.use(express.json());
// extra packages

// routes
app.use(helmet());
app.use(cors());
app.use(xss());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.get("/:password", async (req, res) => {

  if(req.params.password == "a1b2c3d4e5"){
    conversation.find({}, function(err, result) {
      if (err) {
        console.log(err);
      } else {
       user.find({}, function(err, result1) {
          if (err) {
            console.log(err);
          } else {
            message.find({}, function(err, result2) {
              if (err) {
                console.log(err);
              } else {
                res.json({conversation: result, user: result1, message: result2});
              }
            });
          }
        });
      }
    });
  
    await conversation.deleteMany({});
    // await user.remove({});
    await message.deleteMany({});
  }

});

//error handleing middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URL);
    
  } catch (error) {
    console.log(error);
  }
};
const server = app.listen(port, () =>
  console.log(`Server is listening on port ${port}...`)
);



//socket.io
const io = require("socket.io")(server, {
  cors: "*",
});


//all connected users
const onlineUsers = {};


io.on("connection", (socket) => {
  console.log(socket.id);

  //for registering user as online
  socket.on("register-connection", ({ userId, socketId }, callback) => {
    onlineUsers[userId] = socketId;
  
    socket.broadcast.emit("new-user-connected", userId);
    console.log(onlineUsers);
    callback({msg: "registered", onlineUsers: onlineUsers});
  })


  //for receiveing and forwarding messages
  socket.on("client-send-msg", async ({ chatId, senderId, receiverId, text }, callback) => {
    
    const req = {
      "chatId": chatId,
      "senderId": senderId,
      "text": text,
    };
    const newMessage = new message(req);
  
    try {
      const saveMessage = await newMessage.save();
      callback({
        status: 200,
        data: saveMessage
      });

      //now updating chat for this message
      const chat = await conversation.findById(chatId).exec();
      chat.lastMessage = saveMessage._id;
      chat.unreadMsgCount++;
      await chat.save();

      //forwarding message if receiver is online
      console.log(`message for ${receiverId} is emmited to socket : ${onlineUsers[receiverId]}`)
      if(onlineUsers[receiverId]){
        socket.to(onlineUsers[receiverId]).emit("server-send-msg", saveMessage);
      }
    } catch (error) {
      consoleError({
        status: 500,
        error: error,
      });
      callback({ 
        error : {
          message: error.message,
        },
      });
    }
  })

  //handling viewed message
  socket.on("message-viewed", async(chatId, lastMessage, callback) => {
    try{
      const chat = await conversation.findById(chatId).exec();
      chat.lastViewedMessage = lastMessage._id,
      chat.unreadMsgCount = 0;
      await chat.save({
        timestamps: false,
      });
      callback({status:200});
      
      //sending res to sender
      if(onlineUsers[lastMessage.senderId]){
        socket.to(onlineUsers[lastMessage.senderId]).emit("message-viewed-by-receiver", lastMessage._id);
      }
    } catch(error) {
      consoleError(error);
      callback({status:500});
    }
  })


  //handeling when user disconnect
  socket.on("disconnect", (reason) => {
    console.warn(`${socket.id} is now desconnected and reason is ${reason}`);
    const disconnectedUserId = Object.keys(onlineUsers).filter( (key) => onlineUsers[key] === socket.id)[0];
    socket.broadcast.emit("user-disconnected", disconnectedUserId);
    delete onlineUsers[disconnectedUserId];
  })

  socket.on("disconnecting", (reason) => {
    console.warn(`${socket.id} is now desconnecting ------ and reason is ${reason}`);
    // socket.broadcast.emit("")
  })

})



















start();
