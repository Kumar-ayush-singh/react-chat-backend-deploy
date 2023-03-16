const User = require("../models/user");
const jwt = require("jsonwebtoken");


const auth = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401);
    return;
  }

  console.log(`Authorization header : ${authHeader}`);
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, name: payload.name };

    const user = await User.findById(payload.userId);

    console.log(user);
    if(req.user.name === user.name){
      next();
    }
    else{
      res.status(403);
    }
  } catch (error) {
    res.status(500);
    console.log(error);
  }
};


module.exports = auth;
