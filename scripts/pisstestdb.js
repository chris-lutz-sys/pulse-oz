const fs = require('fs');
const { Client } = require('pg');

// Load CA cert for strict TLS validation
const caCert = fs.readFileSync(__dirname + '/../certs/ca.pem').toString();

const client = new Client({
  host: 'pg-294b7da8-clutzx-aiven1.j.aivencloud.com',
  port: 27550,
  user: 'avnadmin',
password: process.env.DB_PASSWORD, // Use env var in real prod
  database: 'defaultdb',
  ssl: {
    ca: caCert,
    rejectUnauthorized: true, // Enforce strict trust
  },
  connectionTimeoutMillis: 5000,
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const result = await client.query(
      `INSERT INTO customers (customer_name) VALUES ($1) RETURNING customer_id`,
      ['pissyone']
    );

    console.log(`🎯 Inserted customer with ID: ${result.rows[0].customer_id}`);
  } catch (err) {
    console.error('❌ Operation failed:', err.message);
  } finally {
    await client.end();
    console.log('🔚 Connection closed');
  }
})();
