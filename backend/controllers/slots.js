import { eq, and, sql, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { slots as SlotsModel } from "../db/schema/slots.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";

// Booking configuration
const bookingConfig = {
  sameDayMinHours: parseInt(process.env.BOOKING_SAME_DAY_MIN_HOURS || '4'),
  afterHourRestriction: parseInt(process.env.BOOKING_AFTER_HOUR_RESTRICTION || '20'), // RESTORED: 8 PM logic
  nextDayMinHour: parseInt(process.env.BOOKING_NEXT_DAY_MIN_HOUR || '13'),
  timezone: process.env.BOOKING_TIMEZONE || 'Asia/Kolkata',
};

class SlotsController {
  static async get_slots_with_booking_status(req, res) {
    try {
      const { date } = req.query; // Expected format: 'YYYY-MM-DD'

      if (!date) {
        return res.status(400).json({ message: "Date is required (YYYY-MM-DD)." });
      }

      console.log(`🕐 Getting slots for date: ${date}`);

      // Step 1: Count total active groomers
      const totalGroomersResult = await db
        .select({ total: sql`count(*)` })
        .from(GroomersModel)
        .where(
          and(
            eq(GroomersModel.status, 'Active'),
            eq(GroomersModel.delete, false),
          )
        );

      const totalGroomers = parseInt(totalGroomersResult[0]?.total || 0, 10);

      if (totalGroomers === 0) {
        return res.status(400).json({ message: "No active groomers available." });
      }

      // Step 2: Get all time slots
      const slotsList = await db.select().from(SlotsModel);

      // Step 3: Get current server time for time-based restrictions
      const now = new Date();

      // FIXED: Use proper timezone handling
      const istNow = new Date(now.toLocaleString("en-US", { timeZone: bookingConfig.timezone }));
      const currentHour = istNow.getHours();
      const currentMinutes = istNow.getMinutes();

      // Parse requested date for comparison
      const requestedDate = new Date(date + 'T00:00:00.000Z');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log(`📍 Current IST time: ${istNow.toISOString()}, Current hour: ${currentHour}:${currentMinutes.toString().padStart(2, '0')}`);
      console.log(`📍 Requested date: ${requestedDate.toISOString()}, Today: ${today.toISOString()}, Tomorrow: ${tomorrow.toISOString()}`);

      // Step 4: For each slot, check availability and time restrictions
      const results = await Promise.all(
        slotsList.map(async (slot) => {
          const [startTime, endTime] = slot.slot.split(" - "); // e.g., ['09:00', '10:00']
          const [startHour, startMinute] = startTime.split(':').map(Number);

          // Create slot datetime for comparison
          const slotDateTime = new Date(requestedDate);
          slotDateTime.setHours(startHour, startMinute || 0, 0, 0);

          // Check existing bookings (existing logic)
          const bookingsCountResult = await db
            .select({ total: sql`count(*)` })
            .from(BookingsModel)
            .where(and(
              eq(BookingsModel.delete, false),
              eq(sql`DATE(${BookingsModel.appointment_time_slot} AT TIME ZONE 'Asia/Kolkata')`, date),
              sql`(${BookingsModel.appointment_time_slot} AT TIME ZONE 'Asia/Kolkata')::time >= ${startTime}::time AND (${BookingsModel.appointment_time_slot} AT TIME ZONE 'Asia/Kolkata')::time < ${endTime}::time`
            ));

          const totalBookings = parseInt(bookingsCountResult[0]?.total || 0, 10);
          let is_booked = totalBookings >= totalGroomers;

          // NEW: Time-based restrictions
          let is_time_restricted = false;
          let restriction_reason = null;

          // FIXED: Rule 1 - Check if slot is in the past
          if (slotDateTime <= istNow) {
            is_time_restricted = true;
            restriction_reason = "This slot has already passed";
            console.log(`🚫 Past slot restriction applied for slot ${slot.slot}: ${restriction_reason}`);
          }
          // Rule 2: After 8 PM, disable slots before 1 PM for next day
          else if (currentHour >= bookingConfig.afterHourRestriction && requestedDate.getTime() === tomorrow.getTime()) {
            if (startHour < bookingConfig.nextDayMinHour) {
              is_time_restricted = true;
              restriction_reason = `Slots before ${bookingConfig.nextDayMinHour}:00 are disabled after ${bookingConfig.afterHourRestriction}:00 for next day bookings`;
              console.log(`🚫 Next-day restriction applied for slot ${slot.slot}: ${restriction_reason}`);
            }
          }
          // FIXED: Rule 3: Same-day bookings need 4-hour minimum gap
          else if (requestedDate.getTime() === today.getTime()) {
            // Calculate minimum allowed time (current time + 4 hours)
            const minAllowedTime = new Date(istNow);
            minAllowedTime.setHours(minAllowedTime.getHours() + bookingConfig.sameDayMinHours);

            if (slotDateTime < minAllowedTime) {
              const minAllowedHour = minAllowedTime.getHours();
              const minAllowedMinute = minAllowedTime.getMinutes();
              is_time_restricted = true;
              restriction_reason = `Same-day bookings require ${bookingConfig.sameDayMinHours}-hour advance notice. Earliest booking: ${minAllowedHour}:${minAllowedMinute.toString().padStart(2, '0')}`;
              console.log(`🚫 Same-day restriction applied for slot ${slot.slot}: ${restriction_reason}`);
            }
          }

          // NEW: Mark time-restricted slots as booked (unavailable) for UI consistency
          is_booked = is_booked || is_time_restricted;

          return {
            id: slot.id,
            slot: slot.slot,
            is_booked: is_booked,
            is_time_restricted: is_time_restricted,
            restriction_reason: restriction_reason,
            slot_datetime: slotDateTime.toISOString(), // For debugging
          };
        })
      );

      console.log(`✅ Returning ${results.length} slots for date ${date}`);

      return res.status(200).json({
        message: "Slots with booking status retrieved successfully.",
        data: results,
        current_server_time: istNow.toISOString(),
        current_ist_time: istNow.toLocaleString('en-US', { timeZone: bookingConfig.timezone }),
        timezone: bookingConfig.timezone,
        config: {
          sameDayMinHours: bookingConfig.sameDayMinHours,
          afterHourRestriction: bookingConfig.afterHourRestriction,
          nextDayMinHour: bookingConfig.nextDayMinHour,
        }
      });
    } catch (error) {
      console.error("❌ Failed to get slots:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
}

export default SlotsController;
