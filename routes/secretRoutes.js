import express from "express";
import * as secretController from "../controllers/secretController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/secrets", isAuthenticated, secretController.getSecrets);
router.get("/submit", isAuthenticated, secretController.getSubmit);
router.post("/submit", isAuthenticated, secretController.postSubmit);
router.post("/like/:secretId", isAuthenticated, secretController.toggleLike);
router.post("/delete/:id", isAuthenticated, secretController.deleteSecret);
router.get("/edit/:id", isAuthenticated, secretController.getEdit);
router.post("/edit/:id", isAuthenticated, secretController.postEdit);

export default router;
