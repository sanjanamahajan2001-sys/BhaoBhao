import cron from "node-cron";
import { db } from "../db/index.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { customers as CustomersModel } from "../db/schema/customers.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";
import { booking_reminders as BookingRemindersModel } from "../db/schema/booking_reminders.js";
import { eq, and, sql } from "drizzle-orm";
import { formatUtcToIst } from "../utils/formatDateTime.js";
import { getSmsToken, sendReminderSms } from "../services/otpService.js";

/**
 * Reminder Cron: 7 AM every day
 */
// cron.schedule("34 14 * * *", async () => {
cron.schedule("1 7-19 * * *", async () => {
// cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log("⏰ Running daily reminder cron at "+now);

    // 🔑 Always get a fresh token at the start
    const tokenResult = await getSmsToken();
    if (!tokenResult.success) {
      console.error("❌ Failed to get SMS token:", tokenResult.message);
      return;
    }
    const token = tokenResult.token;

    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // convert UTC → IST
    const today = new Date(istNow.toISOString().split("T")[0]);

    const reminderDays = [10, 5, 3, 2, 1, 0];

    for (const daysBefore of reminderDays) {
      const targetDate = new Date(today.getTime() + daysBefore * 24 * 60 * 60 * 1000);

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
            eq(BookingsModel.status, "Scheduled"),
            sql`DATE(${BookingsModel.appointment_time_slot}) = ${targetDate.toISOString().split("T")[0]}`
          )
        );

      if (bookings.length === 0) continue;

      for (const b of bookings) {
        const bookingId = b.booking.id;
        // const dateIST = formatUtcToIst(b.booking.appointment_time_slot);

        // build message
        const appointmentDate = new Date(b.booking.appointment_time_slot);

        // Convert to IST
        const appointmentIst  = new Date(appointmentDate.getTime() + 5.5 * 60 * 60 * 1000);


        // Format date (e.g., 01 Oct 2025)
        const datePart = appointmentIst.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Format time in 12-hour with AM/PM (e.g., 2:30 PM)
        const timePart = appointmentIst.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        // Final message
        // console.log(b.booking.id);
        const msg = `Hello, this is a friendly reminder of your upcoming appointment on ${datePart} at ${timePart}. We look forward to seeing you! - Bhao Bhao`;
        // console.log(msg);

        // const [datePart, timePart] = formatUtcToIst(b.booking.appointment_time_slot).split(" ");
        // const msg = `Hello, this is a friendly reminder of your upcoming appointment on ${datePart} at ${timePart}. We look forward to seeing you! - Bhao Bhao`;

        // send to customer
        if (b.customer?.mobile_number) {
          // check if reminder already sent today
          const remindersToday = await db
            .select()
            .from(BookingRemindersModel)
            .where(
              and(
                eq(BookingRemindersModel.booking_id, bookingId),
                eq(BookingRemindersModel.user_id, b.customer.id),
                eq(BookingRemindersModel.user_type, "customer"),
                eq(BookingRemindersModel.mode, "sms"),
                sql`DATE(${BookingRemindersModel.sent_at}) = CURRENT_DATE`
              )
            );

          if (remindersToday.length > 0) {
            continue;
          }

          // ✅ if today, only send if appointment is within 4 hours
          if (daysBefore === 0) {
            const diffMs = appointmentIst .getTime() - istNow.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours > 4 || diffHours <= 0) {
              // skip if more than 4h away or already passed
              continue;
            }
          }

          const phone = "91" + b.customer.mobile_number;
          const result = await sendReminderSms(token, phone, msg);

          await db.insert(BookingRemindersModel).values({
            booking_id: bookingId,
            identifier: b.customer.mobile_number,
            mode: "sms",
            user_id: b.customer.id,
            user_type: "customer",
          });

          console.log(`📩 SMS sent to customer ${phone} for booking id ${b.booking.id} sent at ${now}`);
        }

        // send to groomer
        if (b.groomer?.mobile_number) {
          // check if reminder already sent today
          const remindersToday = await db
            .select()
            .from(BookingRemindersModel)
            .where(
              and(
                eq(BookingRemindersModel.booking_id, bookingId),
                eq(BookingRemindersModel.user_id, b.groomer.id),
                eq(BookingRemindersModel.user_type, "groomer"),
                eq(BookingRemindersModel.mode, "sms"),
                sql`DATE(${BookingRemindersModel.sent_at}) = CURRENT_DATE`
              )
            );

          if (remindersToday.length > 0) {
            continue;
          }

          // ✅ if today, only send if appointment is within 2 hours
          if (daysBefore === 0) {
            const diffMs = appointmentIst .getTime() - istNow.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours > 2 || diffHours <= 0) {
              // skip if more than 2h away or already passed
              continue;
            }
          }

          const phone = "91" + b.groomer.mobile_number;
          const result = await sendReminderSms(token,phone,msg);

          await db.insert(BookingRemindersModel).values({
            booking_id: bookingId,
            identifier: b.groomer.mobile_number,
            mode: "sms",
            user_id: b.groomer.id,
            user_type: "groomer",
          });

          console.log(`📩 SMS sent to groomer ${phone} for booking id ${b.booking.id} sent at ${now}:`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error in reminder cron:", error);
  }
},
{
    timezone: "Asia/Kolkata", // Force IST
  }
);
