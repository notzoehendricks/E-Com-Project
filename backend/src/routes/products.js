const router = require('express').Router();
const { sql }   = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  createProduct,
  updateProduct,
  deleteProduct,
 } = require('../controllers/productController');

// GET /api/products → public
router.get('/', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM dbo.Products`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products → protected
router.post('/', verifyToken, createProduct);

// PUT /api/products/:id → protected, only owner
router.put('/:id', verifyToken, updateProduct);

// DELETE /api/products/:id → protected, only owner
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;
