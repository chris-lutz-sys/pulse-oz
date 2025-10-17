const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://avnadmin:AVNS_fURk_SMPWru-7-4OUIp@pg-294b7da8-clutzx-aiven1.j.aivencloud.com:27550/defaultdb?sslmode=require',
  ssl: {
    ca: fs.readFileSync(__dirname + '/../certs/ca.pem').toString(),
    rejectUnauthorized: true,
  },
});

module.exports = client;
