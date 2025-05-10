const { sql } = require('../config/db');

// POST /api/products
async function createProduct(req, res) {
  try {
    //Read incoming fields
    const { name, description, price } = req.body;
    //Grab the seller ID from the verified token
    const sellerId = req.user.id;
    //Insert into DB and return the new record
    const result = await sql.query`
      INSERT INTO dbo.Products (SellerID, Name, Description, Price)
      OUTPUT inserted.*
      VALUES (${sellerId}, ${name}, ${description}, ${price})
    `;
    const newProduct = result.recordset[0];
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const { name, description, price } = req.body;
    const sellerId = req.user.id; // set by JWT middleware

    // 1) Fetch the product to verify it exists and belongs to this user
    const productRes = await sql.query`
      SELECT SellerID FROM dbo.Products WHERE ProductID = ${productId}
    `;
    if (productRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (productRes.recordset[0].SellerID !== sellerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 2) Perform the update and return the updated row
    const updateRes = await sql.query`
      UPDATE dbo.Products
      SET Name        = ${name},
          Description = ${description},
          Price       = ${price}
      OUTPUT inserted.*
      WHERE ProductID = ${productId}
    `;
    res.json(updateRes.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const sellerId = req.user.id;

    // 1) Verify product exists and ownership
    const productRes = await sql.query`
      SELECT SellerID FROM dbo.Products WHERE ProductID = ${productId}
    `;
    if (productRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (productRes.recordset[0].SellerID !== sellerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 2) Delete the product
    await sql.query`DELETE FROM dbo.Products WHERE ProductID = ${productId}`;
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
};
