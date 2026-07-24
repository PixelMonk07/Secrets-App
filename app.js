import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import helmet from "helmet";
import connectPgSimple from "connect-pg-simple";
import passport from "./config/passport.js";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import secretRoutes from "./routes/secretRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { isAuthenticated } from "./middleware/authMiddleware.js";

const app = express();

// View engine setup
app.set("view engine", "ejs");

const PgSession = connectPgSimple(session);

// Middleware
app.use(helmet());
app.use(
  session({
    store: new PgSession({
      conObject: {
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT
      }
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user || null;
  res.locals.messages = req.flash();
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("home.ejs", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user
  });
});

app.use("/", authRoutes);
app.use("/", secretRoutes);

// Error Handling
app.use(errorHandler);

export default app;
