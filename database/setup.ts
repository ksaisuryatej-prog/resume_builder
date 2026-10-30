import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function runSetup() {
  console.log('--- ResumeCraft Database Initializer ---');
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || 'resumecraft_db';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  if (!host || !user) {
    console.log('[Notice] MYSQL_HOST or MYSQL_USER is not populated in .env.');
    console.log('To connect to a live MySQL instance, fill in your credentials in .env and rerun npm run db:setup.');
    console.log('ResumeCraft is currently operating with zero-configuration persistence at data/resumecraft_store.json.');
    process.exit(0);
  }

  try {
    console.log(`Connecting to MySQL host at ${host}:${port} as ${user}...`);
    // Connect without database first to ensure database creation
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('Connected to MySQL server. Executing schema.sql...');
    const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'database', 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('Schema created successfully.');

    console.log('Executing seed.sql with initial admin, roles, skills, and templates...');
    const seedSql = fs.readFileSync(path.resolve(process.cwd(), 'database', 'seed.sql'), 'utf-8');
    await connection.query(seedSql);
    console.log('Database successfully seeded with full relational data.');

    await connection.end();
    console.log('Setup finished successfully!');
  } catch (err: any) {
    console.error('MySQL Setup Error:', err.message);
    console.log('Ensure your MySQL service is running and credentials in .env are correct.');
  }
}

runSetup();
