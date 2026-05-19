import express from "express";
import AddressesController from "../controllers/addresses.js";
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

router.post("/save", requireAuth, AddressesController.save);
router.get("/list", requireAuth, AddressesController.list);
router.delete("/:id", requireAuth, AddressesController.delete);

export default router;
