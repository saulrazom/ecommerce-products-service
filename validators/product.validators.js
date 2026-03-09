const Joi = require('joi');

// Validator for creating a product
const createProductSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().max(1000).allow(''),
    category: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string().valid('MXN', 'USD', 'EUR').default('MXN'),
    stock: Joi.number().integer().min(0).required(),
    isActive: Joi.boolean().default(true)
  })
};

// Validator for updating a product (all fields optional)
const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().max(1000).allow(''),
    category: Joi.string().trim(),
    price: Joi.number().min(0),
    currency: Joi.string().valid('MXN', 'USD', 'EUR'),
    isActive: Joi.boolean()
  }).min(1) // At least one field must be provided in body
};

// Validator for updating stock only
const updateStockSchema = {
  body: Joi.object({
    stock: Joi.number().integer().min(0).required()
  })
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  updateStockSchema
};
