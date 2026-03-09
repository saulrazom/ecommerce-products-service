const request = require('supertest');
const { mockClient } = require('aws-sdk-client-mock');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const app = require('../index');

// Mock DynamoDB and S3
const ddbMock = mockClient(DynamoDBDocumentClient);
const s3Mock = mockClient(S3Client);

// Mock s3Client from our project properly for multer to avoid actual uploads
jest.mock('../utils/s3Client', () => ({
    uploadImageToS3: jest.fn().mockResolvedValue('https://mocked-s3-bucket/image.jpg')
}));

describe('Product Service Endpoints', () => {
    beforeEach(() => {
        ddbMock.reset();
        s3Mock.reset();
        jest.clearAllMocks();
    });

    // --- GET /products ---
    describe('GET /products', () => {
        it('should return a list of products', async () => {
            ddbMock.on(ScanCommand).resolves({
                Items: [
                    { productId: '1', name: 'Product 1', price: 100 },
                    { productId: '2', name: 'Product 2', price: 200 }
                ]
            });

            const res = await request(app).get('/products');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].name).toBe('Product 1');
        });

        it('should handle DynamoDB errors', async () => {
            ddbMock.on(ScanCommand).rejects(new Error('DynamoError'));
            const res = await request(app).get('/products');
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });

        it('should apply query filters correctly', async () => {
            ddbMock.on(ScanCommand).resolves({ Items: [] });
            
            const res = await request(app).get('/products?category=ACCESSORIES&minPrice=10&maxPrice=100&isActive=true');
            expect(res.status).toBe(200);
            
            const calls = ddbMock.commandCalls(ScanCommand);
            expect(calls[0].args[0].input.FilterExpression).toContain('#cat = :category');
            expect(calls[0].args[0].input.FilterExpression).toContain('price >= :minPrice');
            expect(calls[0].args[0].input.FilterExpression).toContain('price <= :maxPrice');
            expect(calls[0].args[0].input.FilterExpression).toContain('isActive = :isActive');
        });
    });

    // --- GET /products/:id ---
    describe('GET /products/:id', () => {
        it('should return a product if it exists', async () => {
            ddbMock.on(GetCommand).resolves({
                Item: { productId: '123', name: 'Test Product' }
            });

            const res = await request(app).get('/products/123');
            expect(res.status).toBe(200);
            expect(res.body.productId).toBe('123');
        });

        it('should return 404 if product not found', async () => {
            ddbMock.on(GetCommand).resolves({}); // No Item returned
            const res = await request(app).get('/products/999');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Product not found');
        });
    });

    // --- POST /products ---
    describe('POST /products', () => {
        it('should create a new product and validate input', async () => {
            ddbMock.on(PutCommand).resolves({});

            const newProduct = {
                name: 'New Mouse',
                description: 'A great mouse',
                category: 'ACCESSORIES',
                price: 50,
                currency: 'USD',
                stock: 10,
                isActive: true
            };

            const res = await request(app)
                .post('/products')
                .send(newProduct);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('productId');
            expect(res.body.name).toBe('New Mouse');
        });

        it('should validate and reject bad input', async () => {
            const badProduct = {
                name: 'M', // Too short
                price: -10 // Invalid price
            };

            const res = await request(app).post('/products').send(badProduct);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation Error');
        });
        
        it('should handle form-data with image correctly', async () => {
             ddbMock.on(PutCommand).resolves({});
             
             const res = await request(app)
                .post('/products')
                .field('name', 'Image Product')
                .field('category', 'ACCESSORIES')
                .field('price', '100')
                .field('stock', '5')
                .attach('image', Buffer.alloc(10), 'test.jpg'); // Mock an image attachment
                
             expect(res.status).toBe(201);
             expect(res.body.imageUrl).toBe('https://mocked-s3-bucket/image.jpg');
        });
    });

    // --- PUT /products/:id ---
    describe('PUT /products/:id', () => {
        it('should update a product successfully', async () => {
            ddbMock.on(UpdateCommand).resolves({
                Attributes: { productId: '123', price: 150 }
            });

            const res = await request(app)
                .put('/products/123')
                .send({ price: 150 });

            expect(res.status).toBe(200);
            expect(res.body.price).toBe(150);
        });

        it('should reject update if no valid fields provided', async () => {
            const res = await request(app).put('/products/123').send({ invalidField: 'test' });
            expect(res.status).toBe(400); // Because it fails the new Joi validate length check, or the controller's empty update check
        });

        it('should update multiple text fields correctly', async () => {
            ddbMock.on(UpdateCommand).resolves({
                Attributes: { productId: '123', name: 'New Name', isActive: false }
            });

            const res = await request(app)
                .put('/products/123')
                .send({ name: 'New Name', isActive: false });

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('New Name');
            expect(res.body.isActive).toBe(false);
        });

        it('should handle DynamoDB errors during update', async () => {
            ddbMock.on(UpdateCommand).rejects(new Error('DynamoUpdateError'));
            const res = await request(app).put('/products/123').send({ price: 150 });
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('error');
        });
    });

    // --- PUT /products/:id/stock ---
    describe('PUT /products/:id/stock', () => {
        it('should update stock successfully', async () => {
             ddbMock.on(UpdateCommand).resolves({
                Attributes: { productId: '123', stock: 55 }
             });

             const res = await request(app).put('/products/123/stock').send({ stock: 55 });
             expect(res.status).toBe(200);
             expect(res.body.stock).toBe(55);
        });

        it('should reject invalid stock updates', async () => {
            const res = await request(app).put('/products/123/stock').send({ stock: -5 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation Error');
        });
    });
});
