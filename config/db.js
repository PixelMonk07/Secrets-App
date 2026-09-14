import pg from "pg";
import "./env.js"


const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
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
