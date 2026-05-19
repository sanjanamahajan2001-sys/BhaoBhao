import express from "express";
import ServicesController from "../controllers/services.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/list/:id", requireAuth, ServicesController.list);

export default router;
