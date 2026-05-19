import express from "express";
import TransactionsController from "../controllers/transactions.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireAuthGroomer } from "../middlewares/requireAuthGroomer.js";
import { requireAuthAdmin } from "../middlewares/requireAuthAdmin.js";

const router = express.Router();

// for groomer
router.post("/new", requireAuthGroomer, TransactionsController.addPayment);
router.get("/bookingPaymentsGroomer/:id", requireAuthGroomer, TransactionsController.getPaymentsByBooking);

// for customer
router.get("/bookingPaymentsCustomer/:id", requireAuth, TransactionsController.getPaymentsByBooking);

// for admin
router.post("/newAdmin", requireAuthAdmin, TransactionsController.addPayment); // Admin can also add transactions (uses same method, checks role internally)
router.get("/bookingPaymentsAdmin/:id", requireAuthAdmin, TransactionsController.getPaymentsByBooking);

export default router;
