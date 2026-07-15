import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import bcrypt from "bcrypt";
import db from "./db.js";
import { ensureAnonymousName } from "../utils/aliasGenerator.js";

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        if (!user.password) {
          return cb(null, false, {
            message: "Use Google Sign-In"
          });
        }
        bcrypt.compare(password, storedHashedPassword, async (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              const alias = await ensureAnonymousName(user.id, db);
              return cb(null, { ...user, anonymous_name: alias });
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.error(err);
    }
  })
);

// Only initialize Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          console.log(profile);
          const result = await db.query("SELECT * FROM users WHERE email = $1", [
            profile.email,
          ]);
          if (result.rows.length === 0) {
            const newUser = await db.query(
              "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
              [profile.email, null]
            );
            return cb(null, newUser.rows[0]);
          } else {
            return cb(null, result.rows[0]);
          }
        } catch (err) {
          return cb(err);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials not configured");
}

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query(
      "SELECT id, email, anonymous_name FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return cb(null, false);
    }

    const user = result.rows[0];

    // ensure old users get alias
    if(!user.anonymous_name) {
      const alias = await ensureAnonymousName(id, db);
      user.anonymous_name = alias;
    }

    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

export default passport;
