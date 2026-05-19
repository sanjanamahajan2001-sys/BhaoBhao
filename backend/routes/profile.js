import express from "express";
import ProfileController from "../controllers/profile.js";
import { requireAuth } from '../middlewares/requireAuth.js';
import { createUploader } from '../utils/uploadFiles.js';

const uploadFiles = createUploader('profilePics', 'images', 5, 'profile_pic'); 

const router = express.Router();

router.post("/save", requireAuth, uploadFiles, ProfileController.save);
router.get("/view", requireAuth, ProfileController.view);

export default router;
