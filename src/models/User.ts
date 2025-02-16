import mongoose from "mongoose";

const roles = ["Medecin", "Patient", "Secretaire"] as const;


interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    role: typeof roles[number];
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: roles, required: true }

});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
