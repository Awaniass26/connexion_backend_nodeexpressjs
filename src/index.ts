import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/connectDB";
import cors from "cors";
import { dRoles } from "./utils/dRoles";
import swaggerRoutes from "./swagger";
import authRouter from './routes/authRoutes';
import rdvRoutes from "./routes/rdvRoutes";


dotenv.config();

const app = express();
connectDB();
dRoles();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", 
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));

app.use('/auth', authRouter);
app.use("/rdv", rdvRoutes);
app.use(swaggerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📄 Documentation Swagger : http://localhost:${PORT}/api-docs`);
});

