import { InferSchemaType, Schema,  model } from "mongoose";

interface IRole {
    name: string,
}

const roleSchema: Schema<IRole> = new Schema({
    name: String,
});

type Role = InferSchemaType<typeof roleSchema>;

const RoleModel = model<Role>("Role", roleSchema);

export { IRole, Role, RoleModel };