var express = require("express");
var authRouter = express.Router();
var controller = require("../controllers/auth.controller");

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Login a user
 *     description: Login user with a given username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The users login name
 *               password:
 *                 type: string
 *                 description: The users password
 *     responses:
 *       200:
 *         description: The users id, it's username, it's roles and the x-access-token for further authorization.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Internal server error.
 *       404:
 *         description: User not found.
 *       401:
 *         description: Invalid password.
 */
authRouter.post("/signin", controller.signin);

module.exports = authRouter;
