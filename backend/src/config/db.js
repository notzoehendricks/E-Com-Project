const sql = require('mssql');

const config = {
  server:   process.env.DB_HOST,
  port:     1433,                   // or parseInt(process.env.DB_PORT)
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  options: { trustServerCertificate: true },
};

async function connect() {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.error('DB Connection Error:', err);
    process.exit(1);
  }
}

module.exports = { sql, connect };
