import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API for frontendService",
      version: "1.0.0",
      description:
        "This is a REST API application made with Express. It retrieves data from MongoDB.",
      contact: {
        name: "Dominik Mack",
      },
    },
  },
  servers: [
    {
      url: "http://localhost:8080/",
      description: "Localhost server",
    },
  ],
  apis: ["./app/routers/*.ts"],
};

export default swaggerJSDoc(options);
