import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Auth avec Express et TypeScript",
            version: "1.0.0",
        },
    },
    apis: [`${__dirname}/routes/*.ts`]};

const swaggerSpec = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
