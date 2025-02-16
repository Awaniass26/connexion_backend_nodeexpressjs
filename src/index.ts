import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/connectDB";
import authRoutes from "./routes/authRoutes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

dotenv.config();

const app = express();
connectDB();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", 
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}));


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Auth avec Express et TypeScript",
            version: "1.0.0",
        },
    },
    apis: [`${__dirname}/routes/*.ts`], 
};

const swaggerSpec = swaggerJsDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📄 Documentation Swagger : http://localhost:${PORT}/api-docs`);
});

