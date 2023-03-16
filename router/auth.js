const express = require("express");
const User = require("../models/user");
const consoleError = require("./showError");

const router = express.Router();


router.post("/sign-up", async (req, res) => {

    console.log("\n\nRoute /auth/sign-up/ :-");
    console.log(`\t>> Request Body >>>>`);
    console.log(req.body);

    try{
        const user = await User.create({ ...req.body });
        const token = user.createJwt();
        res.status(200).json({
            user: { userName: user.name, email: user.email, userId: user._id, avatar: user.avatar },
            token,
        });
    }
    catch(e){
        consoleError(e);

        const errors={};
        if(e.errors){
            Object.keys(e.errors).map(key => {
                errors[key] = e.errors[key].message;
            })
            console.log(errors);
        }
        else{
            errors.msg = e.message;
        }
        res.status(500).json(errors);
    }
});


router.post("/sign-in", async (req, res) => {

    console.log("\n\nRoute /auth/sign-in/ :-");
    console.log(`\t>> Request Body >>>>`);
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(500).json({ msg: "Please provide password and email" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(500).json({ msg: "user doesnt exsist" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(500).json({ msg: "Invalid Credentials" });
    }
    
    console.log(isPasswordCorrect?"Password matched":"Password not match");
    
    const token = await user.createJwt();
    res.status(200).json({ user: { userName: user.name, userId: user._id, email: email, avatar: user.avatar }, token });
});

module.exports = router;
