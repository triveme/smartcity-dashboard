import { InferSchemaType, Schema, Types, model } from "mongoose";
import { Role } from "./role.model";

interface IUser {
    id?: string,
    username: string,
    password: string,
    roles?: [Role],
}

const userSchema: Schema<IUser> = new Schema({
    username: String,
    password: String,
    roles: [
        {
            type: Types.ObjectId,
            ref: "Role",
        }
    ]
});

type User = InferSchemaType<typeof userSchema>;

const UserModel = model<User>("User", userSchema);

export { IUser, User, UserModel };
