var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Members Only" });
});

router.get("/sign-up", (req, res) =>
  res.render("sign-up-form", { title: "Sign Up" })
);

module.exports = router;
