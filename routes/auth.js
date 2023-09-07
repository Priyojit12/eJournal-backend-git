const fetchUser = require('../middleware/fetchUser');
const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const JWT_secret = "iamagoodbot$";

router.post(
  "/createuser",
  [
    body("email", "enter a valid email").isEmail(),
    body("password", "pass is not long enough").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "Sorry a user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        password: secPassword,
        email: req.body.email,
      });

      const data = {
        user: { id: user.id },
      };

      const authToken = jwt.sign(data, JWT_secret);
      res.json({authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Send error occured");
    }
  }
);

router.post(
  "/userLogin",
  [
    body("email", "enter a valid email").isEmail(),
    body("password", "password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({success, error: "Please Enter correct email" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({success,  error: "Please Enter correct password" });
      }

      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_secret);
      success = true;
      res.json({success,authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured");
    }
  }
);

router.post("/getuser",fetchUser, async (req,res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured");
  }
});
module.exports = router;
