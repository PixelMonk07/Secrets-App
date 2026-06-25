import db from "../config/db.js";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export const getSecrets = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT secret FROM secrets WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    const secrets = result.rows;
    res.render("secrets.ejs", { secrets: secrets });
  } catch (err) {
    logger.error(err);
    res.render("secrets.ejs", { secrets: [] });
  }
};

export const getSubmit = (req, res) => {
  res.render("submit.ejs");
};

export const postSubmit = async (req, res) => {
  const secret = req.body.secret;

  try {
    await db.query(
      "INSERT INTO secrets(user_id, secret) VALUES($1, $2)",
      [req.user.id, secret]
    );
    res.redirect("/secrets");
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to submit secret"
    });
  }
};
