const express = require("express");
// const Product = require("../models/user");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const consoleError = require("./showError");
const auth = require("../middleware/auth");

const router = express.Router();


//adding auth middleware
router.use(auth);


router.route("/update-user/:id")
  .post(async (req, res) => {

    // console.log("\n\nRoute /user/update-user/:id(post) :-");
    // console.log(`\t>> Request Body >>>>`);
    // console.log(req.body);

    if (req.params.id) {
      if (req.body.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
          consoleError(err);
          return res.status(500).json(err);
        }
      }
    }
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json({msg: "Account has been updated"});
    } catch (err) {
      consoleError(err);
      return res.status(500).json(err);
    }
  })
  .delete(async (req, res) => {

    console.log("\n\nRoute /user/update-user/:id(delete) :-");
    console.log(`\t>> Request parameter >>>>`);
    console.log(req.params);

    const user = await User.findByIdAndDelete({ _id: req.params.id });
    if (!user) {
      res.json({ msg: "user not found" });
      console.log("\t>> User not found");
    }
    res.status(200).json({ msg: `deleted user with id of ${user.name}` });
  })
  .get( async (req, res) => {

    // console.log("\n\nRoute /user/update-user/:id(get) :-");
    // console.log(`\t>> Request parameter >>>>`);
    // console.log(req.params);

    const user = await User.findById({ _id: req.params.id });
    if (!user) {
      res.json({ msg: "user not found" });
      console.log("\t>> user not found")
    }
    const { name, _id, email } = user;
    const newUser = { name, id: _id, email };
    res.status(200).json(newUser);
  });


router.get("/get-all/", async (req, res) => {

  console.log("\n\nRoute /user/get-all/ :-");
  console.log(`\t>> Request Parameters >>>>`);
  console.log(req.params);
  
  const user = await User.find({});
  if (!user) {
    res.json({ msg: "Users not found" });
    console.log("\t>> Users not found.");
  }

  // const { name, _id, email } = user;
  // const newUser = { name, id: _id, email };
  res.status(200).json(user);
});



router.post("/set-avatar", async (req, res) => {
  const user = await User.findById(req.user.userId).exec();

  user.avatar = req.body.avatar;
  const updatedUser = await user.save();


  res.status(200).send(updatedUser.avatar);
})



module.exports = router;
