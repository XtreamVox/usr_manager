import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Usr Manager API",
      version: "1.0.0",
      description: "Documentacion interactiva de la API de usuarios, companias, clientes, proyectos y albaranes.",
    },
    servers: [
      {
        url: "/",
        description: "Servidor actual",
      },
    ],
  },
  apis: ["./src/docs/**/*.js", "./src/routes/**/*.js"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
