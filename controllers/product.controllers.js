const { ScanCommand, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../utils/dynamoclient');
const config = require('../config/env');
const crypto = require('crypto');

const TableName = process.env.PRODUCTS_TABLE || config.productsTable;

const getProducts = async (req, res) => {
  try {
    const out = await docClient.send(new ScanCommand({ TableName }));
    return res.json(out.Items || []);
  } catch (error) {
    console.error('[GET PRODUCTS ERROR]', error);
    return res.status(500).json({ error: error.name || 'UnknownError' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const out = await docClient.send(new GetCommand({
      TableName,
      Key: { productId: id }
    }));
    if (!out.Item) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(out.Item);
  } catch (error) {
    console.error('[GET PRODUCT ERROR]', error);
    return res.status(500).json({ error: error.name || 'UnknownError' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, currency, stock, isActive } = req.body;
    
    // Create new product object based on the model
    const newProduct = {
      productId: crypto.randomUUID(),
      name,
      description,
      category,
      price: price || 0,
      currency: currency || 'MXN',
      stock: stock || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName,
      Item: newProduct
    }));

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('[CREATE PRODUCT ERROR]', error);
    return res.status(500).json({ error: error.name || 'UnknownError' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent updating protected fields directly through this endpoint
    delete updates.productId;
    delete updates.createdAt;
    
    // Explicit list of updatable fields as per model
    const allowedFields = ['name', 'description', 'category', 'price', 'currency', 'isActive'];
    
    let updateExpression = 'SET updatedAt = :u';
    let expressionAttributeValues = { ':u': new Date().toISOString() };
    let expressionAttributeNames = {};
    
    let hasUpdates = false;

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        hasUpdates = true;
        const alias = `#${key}`;
        const valAlias = `:${key}`;
        updateExpression += `, ${alias} = ${valAlias}`;
        expressionAttributeNames[alias] = key;
        expressionAttributeValues[valAlias] = updates[key];
      }
    }

    if (!hasUpdates) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const updateParams = {
      TableName,
      Key: { productId: id },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    if (Object.keys(expressionAttributeNames).length > 0) {
      updateParams.ExpressionAttributeNames = expressionAttributeNames;
    }

    const response = await docClient.send(new UpdateCommand(updateParams));

    return res.json(response.Attributes);
  } catch (error) {
    console.error('[UPDATE PRODUCT ERROR]', error);
    return res.status(500).json({ error: error.name || 'UnknownError' });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ error: 'Stock amount is required' });
    }

    const updatedAt = new Date().toISOString();

    const response = await docClient.send(new UpdateCommand({
      TableName,
      Key: { productId: id },
      UpdateExpression: 'SET stock = :s, updatedAt = :u',
      ExpressionAttributeValues: {
        ':s': stock,
        ':u': updatedAt
      },
      ReturnValues: 'ALL_NEW'
    }));

    return res.json(response.Attributes);
  } catch (error) {
    console.error('[UPDATE PRODUCT STOCK ERROR]', error);
    return res.status(500).json({ error: error.name || 'UnknownError' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock
};
