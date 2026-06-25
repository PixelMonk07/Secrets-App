import pg from "pg";
import "./env.js"


const db = new pg.Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "secrets",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
  max: 20,
});

(async () => {
  try {
    const client = await db.connect();
    console.log("Database connected successfully");
    client.release();
  } catch (err) {
    console.error("Database connection failed");
    console.error(err);
    process.exit(1);
  }
})();

export default db;
