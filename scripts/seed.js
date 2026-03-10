require('dotenv').config();
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../utils/dynamoClient');
const config = require('../config/env');
const crypto = require('crypto');

const TableName = process.env.PRODUCTS_TABLE || config.productsTable;

const categories = ['ELECTRONICS', 'ACCESSORIES', 'COMPUTERS', 'HOME', 'FURNITURE'];
const currencies = ['MXN', 'USD'];

const generateSampleProducts = (count) => {
  const products = [];
  for (let i = 1; i <= count; i++) {
    products.push({
      productId: crypto.randomUUID(),
      name: `Sample Product ${i} ${crypto.randomBytes(2).toString('hex')}`,
      description: `Description for sample product ${i}. High quality item.`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: Number((Math.random() * 5000 + 10).toFixed(2)),
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      stock: Math.floor(Math.random() * 100),
      isActive: Math.random() > 0.1, // 90% active
      imageUrl: `https://picsum.photos/seed/${i}/400/400`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  return products;
};

const seedDatabase = async () => {
  console.log(`Starting to seed ${TableName} table...`);
  const products = generateSampleProducts(20);
  
  let successCount = 0;
  for (const product of products) {
    try {
      await docClient.send(new PutCommand({
        TableName,
        Item: product
      }));
      successCount++;
      process.stdout.write('.');
    } catch (error) {
      console.error(`\nFailed to insert product ${product.name}:`, error.message);
    }
  }
  console.log(`\n\nSeed complete! Inserted ${successCount} out of 20 products.`);
};

seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal Seed Error:', err);
    process.exit(1);
  });
