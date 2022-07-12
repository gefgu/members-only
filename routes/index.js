var express = require("express");
var router = express.Router();
const { body, validationResult, check } = require("express-validator");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Members Only" });
});

router.get("/sign-up", (req, res) =>
  res.render("sign-up-form", { title: "Sign Up" })
);

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
    console.log(req.body);
    console.log(errors);
    res.redirect("/");
  },
]);

module.exports = router;
