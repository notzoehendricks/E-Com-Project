const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { sql } = require('../config/db');
const { JWT_SECRET } = process.env;

// POST /api/auth/register
async function register(req, res) {
  try {
    const { firstName, lastName, email, password, role = 'Buyer' } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await sql.query`
      INSERT INTO dbo.Users (FirstName, LastName, Email, Password, Role)
      VALUES (${firstName}, ${lastName}, ${email}, ${hashedPassword}, ${role})
    `;

    const userResult = await sql.query`
      SELECT UserID, Role FROM dbo.Users WHERE Email = ${email}
    `;
    const user = userResult.recordset[0];

    const token = jwt.sign(
      { userId: user.UserID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    if (err.number === 2627) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await sql.query`
      SELECT UserID, Password, Role
      FROM dbo.Users
      WHERE Email = ${email}
    `;
    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.UserID, role: user.Role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { register, login };
