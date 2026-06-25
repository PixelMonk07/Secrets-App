import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import connectPgSimple from "connect-pg-simple";
import { body, validationResult } from "express-validator";
import winston from "winston";
import flash from "connect-flash";
import { cleanEnv, str, port } from "envalid";

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


const app = express();
const serverPort = 3000;
const saltRounds = 10;
env.config();

const envVars = cleanEnv(process.env, {
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  SESSION_SECRET: str(),

  PG_USER: str(),
  PG_HOST: str(),
  PG_DATABASE: str(),
  PG_PASSWORD: str(),
  PG_PORT: port()
})

app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try again later."
});

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      conObject: {
        user: envVars.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT
      }
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(flash());



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
})

const db = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
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

const registerValidation = [
  body("username")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
];

app.use("/login", authLimiter);
app.use("/register", authLimiter);


app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const result = await db.query("SELECT secret FROM secrets WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
      const secrets = result.rows;
      res.render("secrets.ejs", { secrets: result.rows });
    } catch (err) {
      logger.error(err);
      res.render("secrets.ejs", { secrets: [] });
    }
  } else {
    res.redirect("/login");
  }
});

//TODO: Add a get route for the submit button
//Think about how the logic should work with authentication.
app.get("/submit", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit.ejs");
  }
  else {
    res.redirect("/login");
  }
})

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", registerValidation, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
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
            logger.info("User logged in successfully");
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    logger.error(err);
  }
});

//TODO: Create the post route for submit.
//Handle the submitted data and add it to the database
app.post("/submit", async (req, res) => {
  const secret = req.body.secret;
  console.log(req.user);

  try {
    await db.query("INSERT INTO secrets(user_id, secret) VALUES($1, $2)", [req.user.id, secret]);
    res.redirect("/secrets");
  } catch (err) {
    logger.error(err);
  }

})

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
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
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      logger.error(err);
    }
  })
);

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
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );

    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});
