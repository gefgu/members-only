var express = require("express");
var router = express.Router();
const { body, validationResult, check } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Members Only" });
});

router.get("/sign-up", (req, res) =>
  res.render("sign-up-form", { title: "Sign Up", errors: undefined })
);

// Add prevention of equal username
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

router.get("/new-message", (req, res) =>
  res.render("message-form", { title: "Message Form", errors: undefined })
);

module.exports = router;
