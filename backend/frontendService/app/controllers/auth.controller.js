require("dotenv").config();
const db = require("../models");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      // 500 - internal server error
      if (err) {
        console.log(err);
        res.status(500).send({ message: err });
        return;
      }

      // 404 - Not Found
      if (!user) {
        console.log(`User ${req.body.username} not found`);
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      // 401 - Unauthorized
      if (!passwordIsValid) {
        console.log(`Password for user ${req.body.username} is invalid`);
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      if (user.roles) {
        for (let i = 0; i < user.roles.length; i++) {
          authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
        }
      }

      // 200 - OK

      res.status(200).send({
        id: user._id,
        username: user.username,
        roles: authorities,
        accessToken: token,
      });
    });
};
