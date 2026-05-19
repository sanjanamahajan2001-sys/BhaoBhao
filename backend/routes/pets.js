import express from "express";
import PetsController from "../controllers/pets.js";
import { requireAuth } from '../middlewares/requireAuth.js';
import { createUploader } from '../utils/uploadFiles.js';

const uploadFiles = createUploader('petPics', 'images', 5, 'pet_pic');

const router = express.Router();

router.post("/save", requireAuth, uploadFiles, PetsController.save);
router.get("/list", requireAuth, PetsController.list);
router.delete("/:id", requireAuth, PetsController.delete);

export default router;
