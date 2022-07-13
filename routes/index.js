var express = require("express");
var router = express.Router();
const { body, validationResult, check } = require("express-validator");
const User = require("../models/user");
const Message = require("../models/message");
const bcrypt = require("bcryptjs");
const passport = require("passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  Message.find({}, "title content timestamp author")
    .populate("author")
    .exec((err, messages) => {
      res.render("index", { title: "Members Only", messages: messages });
    });
});

router.get("/sign-up", (req, res) =>
  res.render("sign-up-form", { title: "Sign Up", errors: undefined })
);

// TODO: Add prevention of equal username
router.post("/sign-up", [
  body("firstName", "First Name Mmst be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastName", "Last Name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check("password", "Password must have a minimum of 8 characters").isLength({
    min: 8,
  }),
  check(
    "confirmPassword",
    "Confirm Password field must have the same value as the password field"
  )
    .exists()
    .custom((value, { req }) => value === req.body.password),
  (req, res, next) => {
    const errors = validationResult(req);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      membershipStatus: req.body.membershipStatus,
    });

    if (!errors.isEmpty()) {
      res.render("sign-up-form", { title: "Sign Up", errors: errors.array() });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        user.password = hashedPassword;
        user.save((err) => {
          if (err) return next(err);
          res.redirect("/");
        });
      });
    }
  },
]);

router.get("/log-in", (req, res) => {
  res.render("log-in", { title: "Log-In", errors: req?.session?.messages });
});

router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);

router.get("/new-message", (req, res) => {
  if (!req.user) res.redirect("/");
  res.render("message-form", { title: "Message Form", errors: undefined });
});

router.post("/new-message", [
  body("title", "Title must be specified").trim().isLength({ min: 1 }).escape(),
  body("content", "Message content must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    const message = new Message({
      title: req.body.title,
      content: req.body.content,
      timestamp: new Date(),
      author: req.user,
    });
    if (!errors.isEmpty()) {
      res.render("message-form", {
        title: "Message Form",
        errors: errors.array(),
      });
    } else {
      message.save((err) => {
        if (err) next(err);
        res.redirect("/");
      });
    }
  },
]);

router.get("/member", (req, res) =>
  res.render("member-form", { title: "Become member", errors: undefined })
);

router.post("/member", [
  check("passcode", "Passcode is incorrect")
    .exists()
    .custom((value, { req }) => value === process.env.MEMBER_PASSCODE),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("member-form", { title: "Become Member", errors: errors.array() });
    } else {
      let newUser = req.user;
      newUser.membershipStatus = "member";
      User.findByIdAndUpdate(newUser._id, newUser, {}, function (err) {
        if (err) return next(err);

        res.redirect("/");
      });
    }
  },
]);

module.exports = router;
