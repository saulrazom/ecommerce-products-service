const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Products Service API',
      version: '1.0.0',
      description: 'API documentation for the Products Service operations',
    },
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Unique identifier of the product', example: 'P001' },
            name: { type: 'string', description: 'Product name', example: 'Wireless Mouse' },
            description: { type: 'string', description: 'Product description', example: 'Ergonomic wireless mouse' },
            category: { type: 'string', description: 'Product category', example: 'ACCESSORIES' },
            price: { type: 'number', description: 'Product price', example: 399.99 },
            currency: { type: 'string', description: 'Currency used for the price', example: 'MXN' },
            stock: { type: 'number', description: 'Available stock quantity', example: 50 },
            isActive: { type: 'boolean', description: 'Indicates if the product is available', example: true },
            imageUrl: { type: 'string', description: 'URL of the product image stored in S3', example: 'https://my-bucket.s3.us-east-2.amazonaws.com/products/1234.jpg' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp', example: '2026-03-05T18:30:00Z' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp', example: '2026-03-05T18:30:00Z' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Files containing annotations
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwaggerDocs;
