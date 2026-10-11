import express, { Router } from "express";
import {
  loginUser,
  seedUsers,
  verifyUser,
} from "../controllers/authController";
import { authenticate, requireSuperAdmin } from "../middleware/auth";

const router: Router = express.Router();

router.post("/login", loginUser);
router.get("/verify", authenticate, verifyUser);
router.post("/seed", authenticate, requireSuperAdmin, seedUsers);

export default router;
