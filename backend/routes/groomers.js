import express from "express";
import GroomersController from "../controllers/groomers.js";
import { requireAuthAdmin } from "../middlewares/requireAuthAdmin.js";
import { createUploader } from '../utils/uploadFiles.js';

const uploadFiles = createUploader('groomerPics', 'images', 5, 'groomer_pic');

const router = express.Router();

// for admin
router.get("/all", requireAuthAdmin, GroomersController.listAll);
router.post("/save", requireAuthAdmin, uploadFiles, GroomersController.save);
router.delete("/delete/:id", requireAuthAdmin, GroomersController.delete);

export default router;
