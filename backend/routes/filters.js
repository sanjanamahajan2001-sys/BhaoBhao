import express from "express";
import FiltersController from "../controllers/filters.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/servicesPage", requireAuth, FiltersController.services_page);

export default router;
