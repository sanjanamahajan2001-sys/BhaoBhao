import express from "express";
import APIController from "../controllers/api.js";
// import { requireAuth } from '../middlewares/requireAuth.js';
import { apiAuth } from '../middlewares/apiAuth.js';

const router = express.Router();

router.post("/insert", apiAuth, APIController.insert);
router.post("/read", apiAuth, APIController.read);
router.post("/soft-delete", apiAuth, APIController.softDelete);
router.post("/update", apiAuth, APIController.update);

export default router;