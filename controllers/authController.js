import bcrypt from "bcrypt";
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

const saltRounds = 10;

export const getLogin = (req, res) => {
  res.render("login.ejs");
};

export const getRegister = (req, res) => {
  res.render("register.ejs");
};

export const postRegister = async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            logger.info("User registered and logged in successfully");
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    logger.error(err);
    res.redirect("/register");
  }
};

export const logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

export const getGoogleAuth = (req, res) => {
  res.redirect("/auth/google/secrets");
};
