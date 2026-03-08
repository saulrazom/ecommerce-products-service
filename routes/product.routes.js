const { Router } = require('express');
const multer = require('multer');
const validate = require('../middlewares/validate');
const { createProductSchema, updateProductSchema, updateStockSchema } = require('../validators/product.validators');

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock
} = require('../controllers/product.controllers');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (e.g. ACCESSORIES)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by availability (true/false)
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
 *         multipart/form-data:
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
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image to upload to S3
 *     responses:
 *       201:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post('/', upload.single('image'), validate(createProductSchema), createProduct);

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string', example: 'Wireless Mouse v2' }
 *               description: { type: 'string', example: 'Updated description' }
 *               category: { type: 'string', example: 'ACCESSORIES' }
 *               price: { type: 'number', example: 450.00 }
 *               currency: { type: 'string', example: 'MXN' }
 *               isActive: { type: 'boolean', example: true }
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New product image to upload to S3 (optional)
 *     responses:
 *       200:
 *         description: The updated product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.put('/:id', upload.single('image'), validate(updateProductSchema), updateProduct);

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
router.put('/:id/stock', validate(updateStockSchema), updateProductStock);

module.exports = router;
