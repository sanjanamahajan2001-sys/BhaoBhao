import express from "express";
import CategoriesController from "../controllers/categories.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/list", requireAuth, CategoriesController.list);

export default router;
