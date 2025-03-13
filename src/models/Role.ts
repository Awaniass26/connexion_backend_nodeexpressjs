import mongoose from "mongoose";

interface IRole extends mongoose.Document {
    name: string;
}

const RoleSchema = new mongoose.Schema<IRole>({
    name: { type: String, required: true, unique: true }
});

const Role = mongoose.model<IRole>("Role", RoleSchema);

export default Role;
