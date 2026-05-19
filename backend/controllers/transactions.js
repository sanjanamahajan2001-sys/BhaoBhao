import { db } from "../db/index.js";
import { transactions as TransactionsModel } from "../db/schema/transactions.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { eq, and } from "drizzle-orm";

class TransactionsController {
  // ➕ Add new payment (transaction) for a booking
  static generateTransactionId() {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // e.g., "20250915"
    // const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ''); // e.g., "153045"
    const randomPart = Math.floor(Math.random() * 9000 + 1000); // random 4-digit number
    return `${datePart}/${randomPart}`;
  }

  static async addPayment(req, res) {
    try {
      const groomerId = req.user.userId;
      const userRole = req.user.role;

      const { booking_id, amount, method, notes } = req.body;

      if (!booking_id) throw new Error("Booking ID is required.");
      if (!amount) throw new Error("Amount is required.");
      if (!method) throw new Error("Payment method is required.");

      // Check booking exists
      let booking;
      
      if (userRole === "admin") {
        // Admin can add payment to any booking
        const [bookingResult] = await db
          .select()
          .from(BookingsModel)
          .where(
            and(
              eq(BookingsModel.id, booking_id),
              eq(BookingsModel.delete, false)
            )
          )
          .limit(1);
        booking = bookingResult;
      } else {
        // Groomer can only add payment to their assigned bookings
        const [bookingResult] = await db
          .select()
          .from(BookingsModel)
          .where(
            and(
              eq(BookingsModel.id, booking_id),
              eq(BookingsModel.groomer_id, groomerId),
              eq(BookingsModel.delete, false)
            )
          )
          .limit(1);
        booking = bookingResult;
      }

      if (!booking) {
        return res.status(403).json({
          message: userRole === "admin" 
            ? "Booking not found." 
            : "Booking not found or not assigned to the groomer."
        });
      }

      // Check total paid so far
      const payments = await db
        .select()
        .from(TransactionsModel)
        .where(
          and(
            eq(TransactionsModel.booking_id, booking_id),
            eq(TransactionsModel.status, "Completed")
          )
        );

      const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const newAmount = parseFloat(amount);

      if (totalPaid + newAmount > parseFloat(booking.total)) {
        return res.status(400).json({
          message: `Payment exceeds booking total. Total paid so far: ₹${totalPaid}. Booking total: ₹${booking.total}.`
        });
      }

      const transaction_id = TransactionsController.generateTransactionId();

      const [newTransaction] = await db
        .insert(TransactionsModel)
        .values({
          booking_id,
          transaction_id,
          amount: parseFloat(amount),
          method,
          notes,
          status: "Completed",  // default status
        })
        .returning();

      return res.status(200).json({
        message: "Payment added successfully.",
        data: newTransaction,
      });
    } catch (error) {
      console.error("❌ Failed to add payment:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

  static async getPaymentsByBooking(req, res) {
    try {
      const { id: booking_id } = req.params;
      const userRole = req.user.role;
      const userId = req.user.userId;
      const customerId = req.user.customerId;

      if (!booking_id) {
        return res.status(400).json({ message: "Booking ID is required." });
      }

      // Fetch booking to validate access
      const [booking] = await db
        .select()
        .from(BookingsModel)
        .where(eq(BookingsModel.id, booking_id))
        .limit(1);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // Role-based access control
      if (userRole === "customer") {
        if (booking.customer_id !== customerId) {
          return res.status(403).json({ message: "Forbidden: Booking does not belong to the customer." });
        }
      } else if (userRole === "groomer") {
        if (booking.groomer_id !== userId) {
          return res.status(403).json({ message: "Forbidden: Booking is not assigned to groomer." });
        }
      }
      // If admin, no extra validation needed

      // Fetch all transactions for the booking
      const transactions = await db
        .select()
        .from(TransactionsModel)
        .where(eq(TransactionsModel.booking_id, booking_id));

      const totalPaid = transactions
        .filter(tx => tx.status === "Completed" && !tx.delete)
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      return res.status(200).json({
        message: "All payments fetched successfully.",
        data: {
          totalPaid,
          transactions,
        },
      });
    } catch (error) {
      console.error("❌ Failed to list all payments by booking:", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
      });
    }
  }

}

export default TransactionsController;

