import express from "express";
import PetTypesController from "../controllers/petTypes.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/list", requireAuth, PetTypesController.list);

export default router;
