const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user.js");
const catchAsync = require("../utils/catchAsync.js");
const users = require("../controllers/users.js");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

// router.get("/register", users.renderRegister);
// router.post("/register", catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true, //flash a msg for us automatically
      failureRedirect: "/login", //if smth go wrong we'll redirect
      failureMessage: true,
      keepSessionInfo: true,
      //successRedirect: "/",
    }),
    users.login
  );

// router.get("/login", users.renderLogin)

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     failureFlash: true, //flash a msg for us automatically
//     failureRedirect: "/login", //if smth go wrong we'll redirect
//     failureMessage: true,
//     keepSessionInfo: true,
//     //successRedirect: "/",
//   }),
//   users.login
// );

router.get("/logout", users.logout);

module.exports = router;
