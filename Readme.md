# E-Commerce Microservices — Database Structure

This document describes the **data structures used in DynamoDB** for the E-Commerce Microservices project.  
The system is composed of **two backend microservices**, each with its own database table.

- **Products Service** → manages the product catalog and stock
- **Orders Service** → manages customer orders

Each service follows the microservices principle of **owning its own data**.

---

# Database Overview

Two DynamoDB tables are used:

| Table Name | Service | Purpose |
|-------------|--------|--------|
| `Products` | Products Service | Stores the product catalog and stock |
| `Orders` | Orders Service | Stores orders created by customers |

---

# Products Table

This table stores all product information available in the store.

## Table Name

Products


## Primary Key

productId (String)


## Product Document Structure

Each product stored in the table follows this structure:

```json
{
  "productId": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "price": 0,
  "currency": "string",
  "stock": 0,
  "isActive": true,
  "imageUrl": "string",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

## Example Product
```json
{
  "productId": "P001",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "category": "ACCESSORIES",
  "price": 399.99,
  "currency": "MXN",
  "stock": 50,
  "isActive": true,
  "imageUrl": "https://s3-us-west-2.amazonaws.com/my-bucket/products/timestamp-filename.jpg",
  "createdAt": "2026-03-05T18:30:00Z",
  "updatedAt": "2026-03-05T18:30:00Z"
}
```

| Field       | Type    | Description                           |
| ----------- | ------- | ------------------------------------- |
| productId   | String  | Unique identifier of the product      |
| name        | String  | Product name                          |
| description | String  | Product description                   |
| category    | String  | Product category                      |
| price       | Number  | Product price                         |
| currency    | String  | Currency used for the price           |
| stock       | Number  | Available stock quantity              |
| isActive    | Boolean | Indicates if the product is available |
| imageUrl    | String  | S3 Public URL of the product image    |
| createdAt   | String  | Creation timestamp                    |
| updatedAt   | String  | Last update timestamp                 |

---

# 🚀 Getting Started

## 1. Environment Variables
Create a `.env` file in the root of the project with the following configuration:

```env
PORT=3000
AWS_REGION=us-east-1
PRODUCTS_TABLE=Products
S3_BUCKET_NAME=your-s3-bucket-name

# AWS Credentials (If not using IAM/MFA Profiles)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## 2. Running Locally (Without Docker)

Install dependencies and start the development server:
```bash
npm install
npm run dev
```

## 3. Running with Docker 🐳

To containerize the application and run it entirely inside Docker, simply run:

```bash
docker-compose up --build -V
```
*Note: The `-V` flag ensures any old anonymous Node modules volumes are cleared, forcing a fresh `npm install` inside the container.*

The API will be available at `http://localhost:3000`.

---

# 🛠 Features & Setup

## 1. Database Seeding
To populate your DynamoDB table with 20 sample products (useful for testing searches, filters, and pagination), run the seed script:
```bash
npm run seed
```
*Note: Make sure your AWS credentials and `PRODUCTS_TABLE` are configured correctly in the `.env` file first.*

## 2. API Documentation (Swagger)
The API uses **Swagger** for interactive documentation. Once the server is running (locally or via Docker), visit:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

From there, you can read the schemas and test all endpoints directly from your browser.

## 3. Postman Collection (For Frontend & QA)
We provide a pre-configured Postman Collection so frontend developers can easily test the API and understand its responses without setting up code.

**How to use it:**
1. Open [Postman](https://www.postman.com/downloads/).
2. Click **Import** and select the `postman_collection.json` file located in the root of this repository.
3. Open the imported folder `E-Commerce Products API`.
4. To test `POST` or `PUT` endpoints that require images: Navigate to the **Body** tab in Postman, find the `image` field (set as type `File`), click "Select Files", choose an image from your computer, and hit **Send**.

## 4. Running Unit Tests
To run the Jest test suite and generate a code coverage report for the API:
```bash
npm test
```
The test suite utilizes mocks (`aws-sdk-client-mock`) to simulate DynamoDB and S3 interactions, so it runs completely offline safely.
