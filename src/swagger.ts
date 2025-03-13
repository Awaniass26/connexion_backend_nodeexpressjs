import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

const router = express.Router();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Auth avec Express et TypeScript",
            version: "1.0.0",
            description: "API de gestion des utilisateurs avec rôles (Secretaire, Medecin, Patient)"
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
    },
    apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsDoc(options);

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

export default router;
