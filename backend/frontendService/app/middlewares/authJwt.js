require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;

/**
 * check if token is provided
 * -> get token from 'x-access-token-' of HTTP headers
 * --> then use jsonwebtoken's verify() function
 */
verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

/**
 * check if roles of the user contains required role or not
 */
isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Admin Role!" });
                return;
            }
        );
    });
};


const authJwt = {
    verifyToken,
    isAdmin
};
module.exports = authJwt;