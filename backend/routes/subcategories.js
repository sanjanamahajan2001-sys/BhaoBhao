import express from "express";
import SubCategoriesController from "../controllers/subcategories.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/listWithServices/:id", requireAuth, SubCategoriesController.list);

export default router;
