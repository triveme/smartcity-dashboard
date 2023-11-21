import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { UserModel, User } from "../models/user.model";

class AuthController {
  public async signin(req: Request, res: Response): Promise<void> {
    dotenv.config();

    try {
      const user: User | null = await UserModel.findOne({
        username: req.body.username
      }).populate('roles', '-__v');

      // 404 - Not Found
      if (!user) {
        console.log(`User ${req.body.username} not found`);
        res.status(404).send({ message: 'User not found' });
        return;
      }

      const passwordIsValid: boolean = bcrypt.compareSync(
        req.body.password,
        user.password,
      );

      if (!passwordIsValid) {
        // 401 - Unauthorized
        console.log(`Password for user ${req.body.username} is invalid`);
        res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
        return;
      } else {
        // 200 - OK
        const secret: string | undefined = process.env.SECRET;
        let token: string;
        
        if(secret !== undefined) {
          token = jwt.sign({ id: user.id }, secret, {
            expiresIn: 86400, // 24 hours
          });
        } else {
          res.status(500).send("Cannot create JWT because secret is undefined");
          return;
        }
      
        const authorities: string[] = [];
        if (user.roles) {
          for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          }
        }

        res.status(200).send({
          id: user.id,
          username: user.username,
          roles: authorities,
          accessToken: token,
        });

        console.log(`User ${user.username} successfully authenticated!`);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err });
    }
  }
}

export default new AuthController();