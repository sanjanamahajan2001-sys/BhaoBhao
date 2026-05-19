import express from "express";
import PetBreedsController from "../controllers/petBreeds.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/list", requireAuth, PetBreedsController.list);

export default router;
