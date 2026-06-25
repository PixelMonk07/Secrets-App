import express from "express";
import passport from "passport";
import { body, validationResult } from "express-validator";
import * as authController from "../controllers/authController.js";
import authLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

const registerValidation = [
  body("username")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
];

router.get("/login", authController.getLogin);
router.get("/register", authController.getRegister);

router.post("/register", authLimiter, registerValidation, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  next();
}, authController.postRegister);

router.post(
  "/login",
  authLimiter,
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/logout", authController.logout);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

export default router;
