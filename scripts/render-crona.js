const fs = require('fs');
const { Client } = require('pg');

// Directly embed your connection string
const dbUrl = 'postgres://avnadmin:AVNS_gnxKAo8YiJ3zfnXtBE6@pg-294b7da8-clutzx-aiven1.j.aivencloud.com:27550/defaultdb?sslmode=require';

// Load the certificate from disk
const caCertContent = fs.readFileSync(__dirname + '/../certs/ca.pem').toString();

// Initialize PostgreSQL client with explicit TLS trust
const client = new Client({
  connectionString: dbUrl,
  ssl: {
    ca: caCertContent,
    rejectUnauthorized: true,
  },
});

async function run() {
  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Database connected successfully.');

    const insertQuery = `
      INSERT INTO customers (customer_name)
      VALUES ($1)
      RETURNING customer_id, customer_name
    `;
    const values = ['sasqatch'];

    const res = await client.query(insertQuery, values);
    console.log('Inserted successfully:', res.rows[0]);

  } catch (err) {
    console.error('FATAL CRON JOB FAILURE:', err.message);
    throw err;
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

run().catch(() => process.exit(1));
