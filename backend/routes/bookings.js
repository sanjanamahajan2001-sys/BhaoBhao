import express from "express";
import BookingsController from "../controllers/bookings.js";
import { requireAuth } from '../middlewares/requireAuth.js';
import { requireAuthAdmin } from "../middlewares/requireAuthAdmin.js";
import { requireAuthGroomer } from "../middlewares/requireAuthGroomer.js";

const router = express.Router();

router.get("/upcoming_bookings", requireAuth, BookingsController.upcoming_bookings);
router.get("/last", requireAuth, BookingsController.last_booking);
router.get("/list", requireAuth, BookingsController.list);
// router.post("/save", requireAuth, BookingsController.save);
router.post("/new", requireAuth, BookingsController.new_booking);
router.put("/update/:id", requireAuth, BookingsController.new_booking);
router.delete("/delete/:id", requireAuth, BookingsController.delete);
// router.get("/bookedTimeSlots", requireAuth, BookingsController.get_booked_time_slots);

// for admin
router.get("/allBookings", requireAuthAdmin, BookingsController.adminAllBookings);
router.put("/assignGroomer/:id", requireAuthAdmin, BookingsController.assign_groomer);

// for groomer
router.get("/myBookings", requireAuthGroomer, BookingsController.groomerBookings);
router.put("/startBooking/:id", requireAuthGroomer, BookingsController.start_booking);
router.put("/completeBooking/:id", requireAuthGroomer, BookingsController.complete_booking);

export default router;
