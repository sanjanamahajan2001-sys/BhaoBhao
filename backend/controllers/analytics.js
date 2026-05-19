import { eq, gte, lt, and, sql, or, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";

class AnalyticsController {

  static async dashboardCounters(req, res) {
    try {
      const now = new Date();
      
      // Start of the current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      // Start of the next month
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      // Start of today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // Start of tomorrow
      const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      // a. Monthly total bookings
      const [{ totalBookings }] = await db
        .select({ totalBookings: sql`count(*)` })
        .from(BookingsModel)
        .where(
          and(
            gte(BookingsModel.appointment_time_slot, monthStart),
            lt(BookingsModel.appointment_time_slot, nextMonthStart),
            eq(BookingsModel.delete, false)
          )
        );

      // b. Number of repeat customers this month
      // Step 1: Get customers with multiple bookings
      const repeatCustomers = await db
        .select({ customer_id: BookingsModel.customer_id, bookingCount: sql`count(*)` })
        .from(BookingsModel)
        .where(
          and(
            gte(BookingsModel.appointment_time_slot, monthStart),
            lt(BookingsModel.appointment_time_slot, nextMonthStart),
            eq(BookingsModel.delete, false)
          )
        )
        .groupBy(BookingsModel.customer_id)
        .having(sql`count(*) > 1`);
      const repeatCustomerCount = repeatCustomers.length;

      // c. Bookings for today
      const [{ todayBookings }] = await db
        .select({ todayBookings: sql`count(*)` })
        .from(BookingsModel)
        .where(
          and(
            gte(BookingsModel.appointment_time_slot, todayStart),
            lt(BookingsModel.appointment_time_slot, tomorrowStart),
            eq(BookingsModel.delete, false)
          )
        );

      // d. Overall status-wise counters
      const statusCounters = await db
        .select({
          status: BookingsModel.status,
          count: sql`count(*)`
        })
        .from(BookingsModel)
        .where(eq(BookingsModel.delete, false))
        .groupBy(BookingsModel.status);

      // e. Count cancelled bookings separately (including deleted ones)
      const [{ cancelledCount }] = await db
        .select({ cancelledCount: sql`count(*)` })
        .from(BookingsModel)
        .where(eq(BookingsModel.status, 'cancelled'));

      // Transform statusCounters array into object
      const statusMap = {
        "Scheduled": 0,
        "In Progress": 0,
        "Completed": 0,
        "cancelled": 0,
      };
      statusCounters.forEach((row) => {
        statusMap[row.status] = Number(row.count);
      });
      
      // Override cancelled count to include all cancelled bookings
      statusMap["cancelled"] = Number(cancelledCount || 0);


      // Total bookings (all statuses, non-deleted)
      const [{ overallTotal }] = await db
        .select({ overallTotal: sql`count(*)` })
        .from(BookingsModel)
        .where(eq(BookingsModel.delete, false));

      return res.status(200).json({
        counters: {
          monthlyTotalBookings: Number(totalBookings || 0),
          monthlyRepeatCustomer: repeatCustomerCount,
          todayBookings: Number(todayBookings || 0),
          overallTotalBookings: Number(overallTotal || 0),
          scheduled: statusMap["Scheduled"],
          inProgress: statusMap["In Progress"],
          completed: statusMap["Completed"],
          cancelled: statusMap["cancelled"],
        },
      });
      
    } catch (error) {
      console.error("❌ Failed to fetch monthly analytics:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  // Groomer dashboard (new)
  static async dashboardCountersGroomer(req, res) {
    try {
      const groomerId = req.user?.userId;
      if (!groomerId) {
        return res.status(401).json({ message: "Unauthorized: Groomer ID missing" });
      }

      // Status-wise counters for this groomer
      const statusCounters = await db
        .select({
          status: BookingsModel.status,
          count: sql`count(*)`,
        })
        .from(BookingsModel)
        .where(
          and(eq(BookingsModel.delete, false), eq(BookingsModel.groomer_id, groomerId))
        )
        .groupBy(BookingsModel.status);

      // Initialize with 0
      const statusMap = { Scheduled: 0, "In Progress": 0, Completed: 0 };
      statusCounters.forEach((row) => {
        statusMap[row.status] = Number(row.count);
      });

      // Total bookings for this groomer
      const [{ total }] = await db
        .select({ total: sql`count(*)` })
        .from(BookingsModel)
        .where(
          and(eq(BookingsModel.delete, false), eq(BookingsModel.groomer_id, groomerId))
        );

      return res.status(200).json({
        counters: {
          total: Number(total || 0),
          scheduled: statusMap["Scheduled"],
          inProgress: statusMap["In Progress"],
          completed: statusMap["Completed"],
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch groomer analytics:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }

}

export default AnalyticsController;

