const { Router } = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock
} = require('../controllers/product.controllers');

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string', example: 'Wireless Mouse' }
 *               description: { type: 'string', example: 'Ergonomic wireless mouse' }
 *               category: { type: 'string', example: 'ACCESSORIES' }
 *               price: { type: 'number', example: 399.99 }
 *               currency: { type: 'string', example: 'MXN' }
 *               stock: { type: 'number', example: 50 }
 *               isActive: { type: 'boolean', example: true }
 *     responses:
 *       201:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post('/', createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string', example: 'Wireless Mouse v2' }
 *               description: { type: 'string', example: 'Updated description' }
 *               category: { type: 'string', example: 'ACCESSORIES' }
 *               price: { type: 'number', example: 450.00 }
 *               currency: { type: 'string', example: 'MXN' }
 *               isActive: { type: 'boolean', example: true }
 *     responses:
 *       200:
 *         description: The updated product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.put('/:id', updateProduct);

/**
 * @swagger
 * /products/{id}/stock:
 *   put:
 *     summary: Update stock quantity of a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock: { type: 'number', example: 35 }
 *     responses:
 *       200:
 *         description: The updated product stock.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.put('/:id/stock', updateProductStock);

module.exports = router;
