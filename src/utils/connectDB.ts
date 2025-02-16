import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);
        console.log(`MongoDB connecté : ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur de connexion MongoDB: ${error}`);
        process.exit(1);
    }
};

export default connectDB;
