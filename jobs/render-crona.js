const { Client } = require('pg');

// 1. Configuration (Reads environment variables ONLY)
// These variables must be set in your shell (test) or Render dashboard (prod)
const dbUrl = process.env.DATABASE_URL;
const caCertContent = process.env.CA_CERT_CONTENT;

// 2. Client Initialization
const client = new Client({
    connectionString: dbUrl,
    ssl: {
        ca: caCertContent, // CERTIFICATE IS READ AS A STRING HERE
        rejectUnauthorized: true,
    },
});

async function run() {
    try {
        console.log('Attempting to connect to database...');
        await client.connect();
        console.log('Database connected successfully.');

        // Original Query Logic remains safely parameterized
        const insertQuery = `
            INSERT INTO customers (customer_name)
            VALUES ($1)
            RETURNING customer_id, customer_name
        `;

        const values = ['sasqatch'];

        const res = await client.query(insertQuery, values);
        console.log('Inserted successfully:', res.rows[0]);

    } catch (err) {
        // Log error clearly for the Render dashboard
        console.error('FATAL CRON JOB FAILURE:', err.message);
        throw err; // Re-throw the error to be caught below
    } finally {
        // GUARANTEE the connection closes, even if an error occurred
        await client.end();
        console.log('Connection closed.');
    }
}

// Top-Level Execution and Failure Signaling
run().catch(error => {
    // If run() throws an error, this ensures the cron job exits with a failure code (1)
    process.exit(1);
});
