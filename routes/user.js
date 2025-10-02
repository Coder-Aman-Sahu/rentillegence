const express=require('express');
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const { saveRedirectUrl } = require('../middleware.js');

const userController=require("../controllers/users.js");

//Sign Up Route
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));


//Login Route
router.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local",{
        failureFlash:true,
        failureRedirect:"/login"}),
        userController.login
   );

//Logout Route
router.get("/logout",userController.logout);

module.exports=router;