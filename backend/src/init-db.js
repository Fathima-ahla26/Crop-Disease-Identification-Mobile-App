import "dotenv/config";
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const database = process.env.DB_NAME || "cropcare";
let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });
  const identifier = connection.escapeId(database);
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${identifier} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE ${identifier}`);
  const schema = await readFile(new URL("../sql/schema.sql", import.meta.url), "utf8");
  // Select the configured database rather than the SQL file's default cropcare.
  const tables = schema.replace(/^CREATE DATABASE[^;]*;\s*USE[^;]*;/i, "");
  for (const statement of tables.split(";").map((sql) => sql.trim()).filter(Boolean)) {
    await connection.query(statement);
  }
  const [rows] = await connection.query("SHOW TABLES");
  console.log(`Database ${database} initialized (${rows.length} tables). Existing data preserved.`);
} catch (error) {
  console.error(`Database setup failed (${error.code || "UNKNOWN"}): ${error.message}`);
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
