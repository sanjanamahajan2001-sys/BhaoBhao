import cron from "node-cron";
import { db } from "../db/index.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { customers as CustomersModel } from "../db/schema/customers.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";
import { booking_reminders as BookingRemindersModel } from "../db/schema/booking_reminders.js";
import { eq, gt, lt, and, sql } from "drizzle-orm";
// import { sendSms } from "../utils/sms.js";
// import { sendEmail } from "../utils/email.js"; // optional
import { formatUtcToIst } from "../utils/formatDateTime.js";

// Run every hour minutes
cron.schedule("0 * * * *", async () => {
// cron.schedule("* * * * *", async () => {
  try {
    // console.log("⏰ Running reminder cron job...");

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Step 1: Fetch bookings in the next 3 days
    const bookings = await db
      .select({
        booking: BookingsModel,
        customer: CustomersModel,
        groomer: GroomersModel,
      })
      .from(BookingsModel)
      .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
      .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
      .where(
        and(
          eq(BookingsModel.delete, false),
          eq(BookingsModel.status, 'Scheduled'),
          gt(BookingsModel.appointment_time_slot, now),
          lt(BookingsModel.appointment_time_slot, threeDaysLater)
        )
      );

    // console.log(bookings);

    for (const b of bookings) {
      const bookingId = b.booking.id;

      // Step 2: Check if reminder already sent today
      const remindersToday = await db
        .select()
        .from(BookingRemindersModel)
        .where(
          and(
            eq(BookingRemindersModel.booking_id, bookingId),
            sql`DATE(${BookingRemindersModel.sent_at}) = CURRENT_DATE`
          )
        );


      if (remindersToday.length > 0) {
        continue; // reminder already sent today
      }

      // Step 3: Send SMS (and/or email)
      const dateIST = formatUtcToIst(b.booking.appointment_time_slot);
      const msg = `Reminder: Your appointment is on ${dateIST}`;

      if (b.customer?.mobile_number) {
        const mobile_number = b.customer?.mobile_number;
        // await sendSms(mobile_number, msg);

        // Insert record into booking_reminders
        await db.insert(BookingRemindersModel).values({
          booking_id: bookingId,
          identifier: mobile_number,
          mode: "sms",
          user_id: b.customer.id,
          user_type: "customer"
        });
      }

      if (b.groomer?.mobile_number) {
        const mobile_number = b.groomer?.mobile_number;
        // await sendSms(
        //   mobile_number,
        //   `Reminder: Appointment with ${b.customer.full_name}'s pet on ${b.booking.appointment_time_slot}`
        // );

        await db.insert(BookingRemindersModel).values({
          booking_id: bookingId,
          identifier: mobile_number,
          mode: "sms",
          user_id: b.groomer.id,
          user_type: "groomer"
        });
      }

      // If you also want email reminders, uncomment:
      /*
      if (b.customer?.email) {
        await sendEmail(b.customer.email, "Appointment Reminder", msg);
        await db.insert(BookingRemindersModel).values({
          booking_id: bookingId,
          mode: "email",
        });
      }
      */
    }
  } catch (error) {
      console.error("❌ Error in automatic reminders cron:", error);
  }
});
