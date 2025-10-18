const fs = require('fs');
const { Client } = require('pg');

// Load CA cert for strict TLS validation
const caCert = fs.readFileSync(__dirname + '/../certs/ca.pem', 'utf8');

// Timeout wrapper
function withTimeout(promise, ms, label = 'operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const client = new Client({
  host: 'pg-294b7da8-clutzx-aiven1.j.aivencloud.com',
  port: 27550,
  user: 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: 'defaultdb',
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  },
  connectionTimeoutMillis: 15000, // internal PG timeout
});

(async () => {
  try {
    console.log('→ Connecting to database...');
    await withTimeout(client.connect(), 20000, 'DB connect');
    console.log('✅ Connected to database');

    const result = await withTimeout(
      client.query(
        `INSERT INTO customers (customer_name) VALUES ($1) RETURNING customer_id`,
        ['fridaybob']
      ),
      9000,
      'DB insert'
    );

    const customerId = result.rows[0]?.customer_id;
    if (customerId) {
      console.log(`🎯 Inserted customer with ID: ${customerId}`);
    } else {
      console.warn('⚠️ Insert succeeded but no customer_id returned');
    }
  } catch (err) {
    console.error('❌ Operation failed:', err.message);
  } finally {
    await client.end().catch(() => {});
    console.log('🔚 Connection closed');
  }
})();
