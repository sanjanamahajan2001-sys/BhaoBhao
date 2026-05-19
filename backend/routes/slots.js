import express from "express";
import SlotsController from "../controllers/slots.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.get("/get_slots_with_booking_status", requireAuth, SlotsController.get_slots_with_booking_status);

export default router;
