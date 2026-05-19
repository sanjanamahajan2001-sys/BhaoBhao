import { eq, sql, inArray, and, desc, lte, gte, gt, lt, or, ilike, asc, ne } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";
import { pets as PetsModel } from "../db/schema/pets.js";
import { services as ServicesModel } from "../db/schema/services.js";
import { service_pricings as ServicePricingsModel } from "../db/schema/service_pricings.js";
import { addresses as AddressesModel } from "../db/schema/addresses.js";
import { customers as CustomersModel } from "../db/schema/customers.js";
import { pet_types as PetTypesModel } from "../db/schema/pet_types.js";
import { pet_breeds as PetBreedsModel } from "../db/schema/pet_breeds.js";
import { transactions as TransactionsModel } from "../db/schema/transactions.js";
import { users as UsersModel } from "../db/schema/users.js";
import { sendMail } from "../utils/mailgun.js";
import { formatDateTimeCustom } from '../utils/formatDateTime.js';
import { getSmsToken, sendAdminBookingSms } from "../services/otpService.js";
import { booking_services as BookingServicesModel } from "../db/schema/booking_services.js";

// Booking configuration for time restrictions
const bookingConfig = {
  sameDayMinHours: parseInt(process.env.BOOKING_SAME_DAY_MIN_HOURS || '4'),
  afterHourRestriction: parseInt(process.env.BOOKING_AFTER_HOUR_RESTRICTION || '20'), // RESTORED: 8 PM logic
  nextDayMinHour: parseInt(process.env.BOOKING_NEXT_DAY_MIN_HOUR || '13'),
  timezone: process.env.BOOKING_TIMEZONE || 'Asia/Kolkata',
};

class BookingsController {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  static generateOrderId() {
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase(); // 7-char alphanum
    return randomStr;
  }

  static async upcoming_bookings(req, res) {
    try {
      const customer_id = req.user?.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const now = new Date();

      // Step 1: Fetch base booking data with joins
      const upcomingBookings = await db
        .select({
          booking: BookingsModel,
          groomer: GroomersModel,
          pet: PetsModel,
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingsModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(
          and(
            eq(BookingsModel.status, "Scheduled"),
            eq(BookingsModel.customer_id, customer_id),
            eq(BookingsModel.delete, false),
            gte(BookingsModel.appointment_time_slot, now)
          )
        )
        .orderBy(asc(BookingsModel.appointment_time_slot))
        .limit(5);

      // Step 2: Extract unique add-on service IDs
      const allAddonIds = [
        ...new Set(
          upcomingBookings
            .flatMap((b) => b.booking.addon_service_ids || [])
            .filter((id) => id)
        ),
      ];

      // Step 3: Fetch add-on service details
      let addonDetails = [];
      if (allAddonIds.length > 0) {
        addonDetails = await db
          .select({
            id: ServicesModel.id,
            service_name: ServicesModel.service_name,
            price: ServicePricingsModel.discounted_price,
          })
          .from(ServicesModel)
          .leftJoin(ServicePricingsModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
          .where(inArray(ServicesModel.id, allAddonIds));
      }

      // Step 4: Enrich each booking with its add-ons
      const enrichedBookings = upcomingBookings.map((b) => {
        const addonIds = Array.isArray(b.booking.addon_service_ids)
          ? b.booking.addon_service_ids
          : [];

        const addons = addonIds
          .map((id) => addonDetails.find((a) => a.id === id))
          .filter(Boolean);

        return { ...b, addon_services: addons };
      });

      return res.status(200).json({
        success: true,
        count: enrichedBookings.length,
        data: enrichedBookings,
      });
    } catch (error) {
      console.error("❌ Failed to fetch upcoming bookings:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }




  static async last_booking(req, res) {
    try {
      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const latestBooking = await db
        .select({
          // ...BookingsModel,
          // service_name: ServicesModel.service_name,
          // service_date: sql`DATE(${BookingsModel.createdat})`.as("service_date"),
          booking: BookingsModel,
          groomer: GroomersModel,
          pet: PetsModel,
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        // .leftJoin(
        //   ServicesModel,
        //   eq(ServicesModel.id, BookingsModel.service_id)
        // )
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingsModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(
          and(
            eq(BookingsModel.customer_id, customer_id),
            eq(BookingsModel.delete, false)
            // eq(BookingsModel.status, "Completed")
          )
        )
        .orderBy(desc(BookingsModel.appointment_time_slot))
        .limit(1);

      return res.status(200).json({
        data: latestBooking[0] || null,
      });
    } catch (error) {
      console.error("❌ Failed to fetch latest booking:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  /**
   * FIXED: Validates appointment time slots against business rules
   */
  static async validateBookingTimeSlots(appointment_time_slots, customer_id) {
    console.log(`🔍 Validating booking time slots for customer ${customer_id}:`, appointment_time_slots);

    const now = new Date();
    const istNow = new Date(now.toLocaleString("en-US", { timeZone: bookingConfig.timezone }));
    const currentHour = istNow.getHours();
    const currentMinutes = istNow.getMinutes();

    const today = new Date(now.toLocaleString("en-US", { timeZone: bookingConfig.timezone }));
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log(`📍 Current IST time: ${istNow.toISOString()}, Current hour: ${currentHour}:${currentMinutes.toString().padStart(2, '0')}`);

    for (const slotString of appointment_time_slots) {
      const slotDateTime = new Date(slotString);
      const istSlotDateTime = new Date(slotDateTime.toLocaleString("en-US", { timeZone: bookingConfig.timezone }));

      const slotTime = istSlotDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: bookingConfig.timezone
      });

      const requestedDate = new Date(slotDateTime.toLocaleString("en-US", { timeZone: bookingConfig.timezone }));
      requestedDate.setHours(0, 0, 0, 0);

      console.log(`📍 Checking slot: ${slotString}, IST Slot time: ${slotTime}, Current IST time: ${istNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
      console.log(`📍 Slot date: ${requestedDate.toISOString()}, Today: ${today.toISOString()}, Tomorrow: ${tomorrow.toISOString()}`);

      if (istSlotDateTime <= istNow) {
        const error = `Cannot book past slots. Current time: ${istNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}, Requested slot: ${slotTime}`;
        console.log(`🚫 Validation failed: ${error}`);
        throw new Error(error);
      }

      if (currentHour >= bookingConfig.afterHourRestriction && requestedDate.getTime() === tomorrow.getTime()) {
        const slotHour = istSlotDateTime.getHours();

        if (slotHour < bookingConfig.nextDayMinHour) {
          const error = `Slots before ${bookingConfig.nextDayMinHour}:00 are disabled after ${bookingConfig.afterHourRestriction}:00 for next day bookings`;
          console.log(`🚫 Validation failed: ${error}`);
          throw new Error(error);
        }
      }

      if (requestedDate.getTime() === today.getTime()) {
        const minAllowedTime = new Date(istNow);
        minAllowedTime.setHours(minAllowedTime.getHours() + bookingConfig.sameDayMinHours);

        if (istSlotDateTime < minAllowedTime) {
          const minAllowedHour = minAllowedTime.getHours();
          const minAllowedMinute = minAllowedTime.getMinutes();
          const error = `Same-day bookings require ${bookingConfig.sameDayMinHours}-hour advance notice. Earliest booking: ${minAllowedHour}:${minAllowedMinute.toString().padStart(2, '0')}`;
          console.log(`🚫 Validation failed: ${error}`);
          throw new Error(error);
        }
      }
    }

    console.log(`✅ All time slots validated successfully`);
    return true;
  }

  static async new_booking(req, res) {
    try {
      process.stdout.write("=== NEW BOOKING CONTROLLER START ===\n");
      console.log = (...args) => {
        process.stdout.write(args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : a)).join(" ") + "\n");
      };
      console.error = (...args) => {
        process.stderr.write(args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : a)).join(" ") + "\n");
      };

      let IsNew = true;
      let bookingId = null;

      if (req.method === "PUT") {
        if (!req.params.id) {
          return res.status(400).json({ message: "Booking ID is required for update." });
        }
        IsNew = false;
        bookingId = req.params.id;
      }

      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const {
        pet_id,
        service_id,
        service_pricing_id,
        address_id,
        pet_size,
        appointment_time_slots,
        amount,
        tax,
        total,
        notes,
        nature,
        health_conditions,
        skin_condition,
        comments,
        payment_method,
        bookingServices, // includes main + addon services
      } = req.body;

      console.log("🟢 Incoming booking request body:", req.body);

      if (!Array.isArray(appointment_time_slots) || appointment_time_slots.length === 0) {
        throw new Error("At least one appointment time slot is required.");
      }

      // NEW: Validate time slots before proceeding
      try {
        await BookingsController.validateBookingTimeSlots(appointment_time_slots, customer_id);
      } catch (validationError) {
        console.log(`🚫 Booking time validation failed: ${validationError.message}`);
        return res.status(400).json({
          message: validationError.message,
          error_type: "TIME_RESTRICTION"
        });
      }

      const amount_db = parseFloat(amount);
      const tax_db = parseFloat(tax);
      const total_db = parseFloat(total);
      const orderId = BookingsController.generateOrderId();

      // 🐾 Update Pet Info
      const petUpdateData = {};
      if (nature !== undefined) petUpdateData.nature = nature || "";
      if (health_conditions !== undefined) petUpdateData.health_conditions = health_conditions || "";
      if (skin_condition !== undefined) petUpdateData.skin_condition = skin_condition || "";
      if (comments !== undefined) petUpdateData.comments = comments || "";

      if (Object.keys(petUpdateData).length > 0) {
        await db
          .update(PetsModel)
          .set(petUpdateData)
          .where(eq(PetsModel.id, pet_id));
        console.log("✅ Pet details updated for pet_id:", pet_id);
      }

      // 🧩 Extract addon service IDs from bookingServices
      const addon_service_ids = Array.isArray(bookingServices)
        ? bookingServices
          .filter(bs => bs.parent_service_id) // Only add-ons
          .map(bs => bs.service_pricing_id)
        : [];

      console.log("🧩 Add-on service IDs to store:", addon_service_ids);

      // -----------------------------------------------------------
      // 🆕 CREATE BOOKING
      // -----------------------------------------------------------
      if (IsNew) {
        console.log("🟢 Creating new booking...");

        const inserted = await db.transaction(async (tx) => {
          // 🆕 Auto-calculate next primary key ID to bypass sequence conflicts entirely
          const [maxBooking] = await tx.select({ maxId: sql`max(id)` }).from(BookingsModel);
          const nextId = (parseInt(maxBooking?.maxId || 0, 10)) + 1;
          console.log(`🎯 Auto-calculated next primary key ID for booking: ${nextId}`);

          const bookingValues = appointment_time_slots.map((slot) => ({
            id: nextId,
            customer_id,
            pet_id,
            service_id,
            service_pricing_id,
            address_id,
            pet_size,
            appointment_time_slot: new Date(slot),
            amount: amount_db,
            tax: tax_db,
            total: total_db,
            notes: notes || null,
            order_id: orderId,
            payment_method,
            addon_service_ids, // store addon IDs array here
          }));

          console.log("📦 Booking values to insert:", bookingValues);

          const [booking] = await tx.insert(BookingsModel).values(bookingValues[0]).returning();

          console.log("✅ Booking inserted with ID:", booking.id);

          // 💾 Insert booking services (main + add-ons)
          if (Array.isArray(bookingServices) && bookingServices.length > 0) {
            const bookingServicesToInsert = bookingServices.map((bs) => ({
              booking_id: booking.id,
              service_pricing_id: bs.service_pricing_id,
              parent_service_id: bs.parent_service_id || null,
              amount: parseFloat(bs.amount || 0),
              tax: parseFloat(bs.tax || 0),
              total: parseFloat(bs.total || 0),
            }));

            console.log("📦 Booking services to insert:", bookingServicesToInsert);

            try {
              await tx.insert(BookingServicesModel).values(bookingServicesToInsert);
              console.log("✅ Booking services inserted for booking_id:", booking.id);
            } catch (err) {
              console.error("❌ Error inserting booking_services:", err);
            }
          } else {
            console.log("⚠️ No booking services provided — skipping insert.");
          }

          return booking;
        });

        console.log("✅ Transaction completed for booking:", inserted);

        // (📧 Email section unchanged...)
        // You can keep your existing mail logic as is

        // 📱 Admin SMS notification
        try {
          const adminPhone = process.env.ADMIN_SMS_PHONE; // Admin phone from .env
          if (adminPhone) {
            // Fetch customer mobile number
            const [customerInfo] = await db
              .select({ mobile_number: CustomersModel.mobile_number })
              .from(CustomersModel)
              .where(eq(CustomersModel.id, customer_id))
              .limit(1);

            const customerMobile = customerInfo?.mobile_number || 'N/A';

            const tokenResult = await getSmsToken();
            if (tokenResult.success) {
              const appointmentDate = new Date(appointment_time_slots[0]);
              // Format date as DD/MM/YYYY
              const datePart = appointmentDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Kolkata" // Ensure IST timezone
              });

              // Format time as 02:00 pm
              const timePart = appointmentDate.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata" // Ensure IST timezone
              }).toLowerCase();

              const smsMessage = `Hi Bhaobhao Admin, there is a new booking on the website. Customer Number: ${customerMobile} , Booked for ${datePart} : ${timePart}`;

              const result = await sendAdminBookingSms(tokenResult.token, adminPhone, smsMessage);
              console.log("📱 Admin SMS notification Status:", result.message);
            }
          }
        } catch (smsError) {
          console.error("❌ Failed to send Admin SMS notification:", smsError.message);
        }

        return res.status(200).json({
          message: "Booking created successfully.",
          data: inserted,
          order_id: orderId,
        });
      }

      // -----------------------------------------------------------
      // ✏️ UPDATE BOOKING
      // -----------------------------------------------------------
      else {
        console.log("🟡 Updating existing booking ID:", bookingId);

        const [updated] = await db
          .update(BookingsModel)
          .set({
            pet_id,
            service_id,
            service_pricing_id,
            address_id,
            pet_size,
            groomer_id: null,
            appointment_time_slot: new Date(appointment_time_slots[0]),
            amount: amount_db,
            tax: tax_db,
            total: total_db,
            notes: notes || null,
            payment_method,
            updatedat: new Date(),
            addon_service_ids, // also update add-on service ids
          })
          .where(
            and(
              eq(BookingsModel.id, bookingId),
              eq(BookingsModel.customer_id, customer_id),
              eq(BookingsModel.status, "Scheduled")
            )
          )
          .returning();

        if (!updated) {
          console.warn("⚠️ Booking not found or cannot be updated:", bookingId);
          return res.status(404).json({ message: "Only scheduled bookings can be updated" });
        }

        console.log("✅ Booking updated:", updated);

        // 🔁 Replace booking_services for that booking
        if (Array.isArray(bookingServices)) {
          console.log("♻️ Updating booking_services for booking_id:", bookingId);

          await db.delete(BookingServicesModel).where(eq(BookingServicesModel.booking_id, bookingId));

          if (bookingServices.length > 0) {
            const bookingServicesToInsert = bookingServices.map((bs) => ({
              booking_id: bookingId,
              service_pricing_id: bs.service_pricing_id,
              parent_service_id: bs.parent_service_id || null,
              amount: parseFloat(bs.amount || 0),
              tax: parseFloat(bs.tax || 0),
              total: parseFloat(bs.total || 0),
            }));

            console.log("📦 New booking services to insert:", bookingServicesToInsert);

            try {
              await db.insert(BookingServicesModel).values(bookingServicesToInsert);
              console.log("✅ Booking services updated for booking_id:", bookingId);
            } catch (err) {
              console.error("❌ Error updating booking_services:", err);
            }
          } else {
            console.log("⚠️ Booking services array empty — no update performed.");
          }
        }

        return res.status(200).json({
          message: "Booking updated successfully.",
          data: updated,
        });
      }
    } catch (error) {
      console.error("❌ Failed to create/update booking:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }


  // static async list(req, res) {
  //   try {
  //     const page = parseInt(req.query.page) || 1;
  //     const limit = parseInt(req.query.limit) || 10;
  //     const offset = (page - 1) * limit;

  //     const upcomingPast = req.query.upcomingPast || "all";
  //     const search = req.query.search?.trim() || null;

  //     const customer_id = req.user.customerId;
  //     if (!customer_id) {
  //       throw new Error("Customer ID not found in user session.");
  //     }

  //     const status = req.query.status || "all"; // "all" | "Scheduled" | "In Progress" | "Completed"

  //     // Base conditions
  //     let conditions = [
  //       eq(BookingsModel.customer_id, customer_id),
  //       eq(BookingsModel.delete, false),
  //     ];


  //     // Apply status filter
  //     if (status !== "all") {
  //       conditions.push(eq(BookingsModel.status, status));
  //     }

  //     // Apply filter if not "all"
  //     if (upcomingPast === "upcoming") {
  //       conditions.push(gt(BookingsModel.appointment_time_slot, sql`NOW()`));
  //     } else if (upcomingPast === "past") {
  //       conditions.push(lt(BookingsModel.appointment_time_slot, sql`NOW()`));
  //     }

  //     // Add search filter
  //     if (search) {
  //       conditions.push(
  //         or(
  //           ilike(PetsModel.pet_name, `%${search}%`),
  //           ilike(ServicesModel.service_name, `%${search}%`),
  //           ilike(GroomersModel.groomer_name, `%${search}%`),
  //           ilike(BookingsModel.order_id, `%${search}%`)
  //         )
  //       );
  //     }

  //     // Step 1: Count total matching bookings
  //     const totalResult = await db
  //       .select({
  //         total: sql`count(*)`,
  //       })
  //       .from(BookingsModel)
  //       .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
  //       .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
  //       .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
  //       .leftJoin(ServicePricingsModel, eq(BookingsModel.service_pricing_id, ServicePricingsModel.id))
  //       .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
  //       .where(and(...conditions));

  //     const total = parseInt(totalResult[0]?.total || 0, 10);

  //     const allBookings = await db
  //       .select({
  //         booking: BookingsModel,
  //         groomer: GroomersModel,
  //         pet: PetsModel,
  //         service: ServicesModel,
  //         service_pricing: ServicePricingsModel,
  //         address: AddressesModel,
  //       })
  //       .from(BookingsModel)
  //       .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
  //       .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
  //       .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
  //       .leftJoin(ServicePricingsModel, eq(BookingsModel.service_pricing_id, ServicePricingsModel.id))
  //       .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
  //       .where(and(...conditions))
  //       .orderBy(desc(BookingsModel.id))
  //       .limit(limit)
  //       .offset(offset);



  //     const bookingIds = allBookings.map(b => b.booking.id);

  //     // Step 2: Fetch transactions related to these bookings
  //     const transactions = await db
  //       .select()
  //       .from(TransactionsModel)
  //       .where(
  //         and(
  //           eq(TransactionsModel.delete, false),
  //           inArray(TransactionsModel.booking_id, bookingIds)
  //         )
  //       );

  //     // Step 3: Map transactions by booking_id
  //     const transactionsByBooking = transactions.reduce((acc, txn) => {
  //       if (!acc[txn.booking_id]) acc[txn.booking_id] = [];
  //       acc[txn.booking_id].push(txn);
  //       return acc;
  //     }, {});

  //     // Step 4: Attach transactions to each booking
  //     const result = allBookings.map(b => ({
  //       ...b,
  //       transactions: transactionsByBooking[b.booking.id] || [],
  //     }));

  //     return res.status(200).json({
  //       data: result,
  //       pagination: {
  //         totalRecords: total,
  //         currentPage: page,
  //         perPage: limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     });
  //   } catch (error) {
  //     console.error("❌ Failed to fetch bookings:", error);
  //     return res.status(500).json({ message: error.message || "Internal Server Error" });
  //   }
  // }

  static async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const upcomingPast = req.query.upcomingPast || "all";
      const search = req.query.search?.trim() || null;

      const customer_id = req.user.customerId;
      if (!customer_id) {
        throw new Error("Customer ID not found in user session.");
      }

      let status = req.query.status || "all"; // may be overridden below

      // Base conditions
      let conditions = [
        eq(BookingsModel.customer_id, customer_id),
        eq(BookingsModel.delete, false),
      ];

      // Apply upcoming/past filter with mandatory status
      if (upcomingPast === "upcoming") {
        // conditions.push(gt(BookingsModel.appointment_time_slot, sql`NOW()`));
        // enforce status Scheduled or In Progress
        conditions.push(
          or(
            eq(BookingsModel.status, "Scheduled"),
            eq(BookingsModel.status, "In Progress")
          )
        );
        status = "enforced"; // override
      } else if (upcomingPast === "past") {
        // conditions.push(lt(BookingsModel.appointment_time_slot, sql`NOW()`));
        // enforce Completed status
        conditions.push(eq(BookingsModel.status, "Completed"));
        status = "enforced";
      } else {
        // only apply user-passed status if upcomingPast=all
        if (status !== "all") {
          conditions.push(eq(BookingsModel.status, status));
        }
      }

      // Add search filter
      if (search) {
        conditions.push(
          or(
            ilike(PetsModel.pet_name, `%${search}%`),
            ilike(ServicesModel.service_name, `%${search}%`),
            ilike(GroomersModel.groomer_name, `%${search}%`),
            ilike(BookingsModel.order_id, `%${search}%`)
          )
        );
      }

      // Step 1: Count total matching bookings
      const totalResult = await db
        .select({
          total: sql`count(*)`,
        })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(
          ServicePricingsModel,
          eq(BookingsModel.service_pricing_id, ServicePricingsModel.id)
        )
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions));

      const total = parseInt(totalResult[0]?.total || 0, 10);

      const allBookings = await db
        .select({
          booking: BookingsModel,
          groomer: GroomersModel,
          pet: PetsModel,
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(
          ServicePricingsModel,
          eq(BookingsModel.service_pricing_id, ServicePricingsModel.id)
        )
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions))
        .orderBy(desc(BookingsModel.id))
        .limit(limit)
        .offset(offset);

      const bookingIds = allBookings.map((b) => b.booking.id);

      // Step 2: Fetch transactions related to these bookings
      const transactions = bookingIds.length
        ? await db
          .select()
          .from(TransactionsModel)
          .where(
            and(
              eq(TransactionsModel.delete, false),
              inArray(TransactionsModel.booking_id, bookingIds)
            )
          )
        : [];

      // Step 3: Map transactions by booking_id
      const transactionsByBooking = transactions.reduce((acc, txn) => {
        if (!acc[txn.booking_id]) acc[txn.booking_id] = [];
        acc[txn.booking_id].push(txn);
        return acc;
      }, {});

      // Step 4: Attach transactions to each booking
      const result = allBookings.map((b) => ({
        ...b,
        transactions: transactionsByBooking[b.booking.id] || [],
      }));
      const allAddonIds = result
        .flatMap((b) => b.booking.addon_service_ids || []) // Get all IDs
        .filter((id) => id != null); // Remove any nulls

      const uniqueAddonIds = [...new Set(allAddonIds)]; // Get unique IDs

      // Step 6: Fetch details for these add-on pricing IDs
      const addonDetails = uniqueAddonIds.length
        ? await db
          .select({
            pricing_id: ServicePricingsModel.id,
            service_name: ServicesModel.service_name,
            price: ServicePricingsModel.discounted_price, // Or .mrp, your choice
            pet_size: ServicePricingsModel.pet_size,
            service_id: ServicesModel.id,
          })
          .from(ServicePricingsModel)
          .leftJoin(
            ServicesModel,
            eq(ServicePricingsModel.service_id, ServicesModel.id)
          )
          .where(
            and(
              // eq(ServicePricingsModel.status, 'Active'), // Optional
              inArray(ServicePricingsModel.id, uniqueAddonIds)
            )
          )
        : [];

      // Step 7: Create a fast lookup map for the add-on details
      const addonsMap = addonDetails.reduce((acc, addon) => {
        acc[addon.pricing_id] = addon;
        return acc;
      }, {});

      // Step 8: Attach transactions AND add-on details to each booking
      const finalResult = result.map((b) => ({
        ...b,
        // transactions: b.transactions, // Already attached in 'result'
        // Use the map to build the addon_services array
        addon_services: (b.booking.addon_service_ids || [])
          .map((id) => addonsMap[id]) // Find the details for each ID
          .filter(Boolean), // Filter out any that weren't found
      }));

      return res.status(200).json({
        data: finalResult,
        pagination: {
          totalRecords: total,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch bookings:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }


  static async delete(req, res) {
    try {
      const customer_id = req.user.customerId;
      const { id } = req.params;

      if (!id) throw new Error("Booking ID is required.");
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const result = await db
        .update(BookingsModel)
        .set({
          delete: true,
          deletedat: new Date(),
          status: 'cancelled',
        })
        .where(
          and(
            eq(BookingsModel.id, id),
            eq(BookingsModel.customer_id, customer_id),
            eq(BookingsModel.delete, false) // optional: ignore already-deleted ones
          )
        );

      return res.status(200).json({
        message: "Booking deleted successfully.",
      });
    } catch (error) {
      console.error("❌ Failed to delete booking:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  // ... (your existing imports for db, models, etc.)

  static async adminAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { status = 'all', search = '' } = req.query;

      // ✅ Base condition - exclude permanently deleted bookings
      let whereConditions = [eq(BookingsModel.delete, false)];

      // ✅ Status filter
      if (status && status !== 'all') {
        if (status === 'Scheduled') {
          whereConditions.push(eq(BookingsModel.status, 'Scheduled'));
        }
        if (status === 'In Progress')
          whereConditions.push(eq(BookingsModel.status, 'In Progress'));
        if (status === 'Completed')
          whereConditions.push(eq(BookingsModel.status, 'Completed'));
        if (status === 'Cancelled') {
          // For cancelled status, only show bookings with status = 'cancelled'
          whereConditions = [
            eq(BookingsModel.status, 'cancelled')
          ];
        }
      }

      // ✅ Search filter (customer, groomer, pet, service, address)
      if (search) {
        const searchPattern = `%${search}%`;
        whereConditions.push(
          or(
            ilike(CustomersModel.customer_name, searchPattern),
            ilike(BookingsModel.order_id, searchPattern),
            ilike(GroomersModel.groomer_name, searchPattern),
            ilike(PetsModel.pet_name, searchPattern),
            ilike(ServicesModel.service_name, searchPattern)
          )
        );
      }

      const finalWhere = and(...whereConditions);

      // Step 1: Count total
      const totalResult = await db
        .select({ total: sql`count(*)` })
        .from(BookingsModel)
        .leftJoin(
          CustomersModel,
          eq(BookingsModel.customer_id, CustomersModel.id)
        )
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(finalWhere);

      const total = parseInt(totalResult[0]?.total || 0, 10);

      // Step 2: Fetch bookings
      const allBookings = await db
        .select({
          customer: CustomersModel,
          booking: BookingsModel,
          groomer: GroomersModel,
          pet: PetsModel,
          pet_type: PetTypesModel,
          pet_breed: PetBreedsModel,
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(
          CustomersModel,
          eq(BookingsModel.customer_id, CustomersModel.id)
        )
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(PetTypesModel, eq(PetsModel.pet_type_id, PetTypesModel.id))
        .leftJoin(PetBreedsModel, eq(PetsModel.breed_id, PetBreedsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(
          ServicePricingsModel,
          eq(BookingsModel.service_pricing_id, ServicePricingsModel.id)
        )
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(finalWhere)
        .orderBy(desc(BookingsModel.id))
        .limit(limit)
        .offset(offset);

      const bookingIds = allBookings.map((b) => b.booking.id);

      // Step 3: Fetch transactions
      const transactions = await db
        .select()
        .from(TransactionsModel)
        .where(
          and(
            eq(TransactionsModel.delete, false),
            inArray(TransactionsModel.booking_id, bookingIds)
          )
        );

      const transactionsByBooking = transactions.reduce((acc, txn) => {
        if (!acc[txn.booking_id]) acc[txn.booking_id] = [];
        acc[txn.booking_id].push(txn);
        return acc;
      }, {});

      const result = allBookings.map((b) => ({
        ...b,
        address: b.address, // Explicitly ensure address is included
        transactions: transactionsByBooking[b.booking.id] || [],
      }));

      // -----------------------------------------------------------------
      // ✨ START: NEW CODE TO FETCH ADD-ON DETAILS
      // -----------------------------------------------------------------

      // Step 4: Get all unique add-on IDs from all bookings
      const allAddonIds = result
        .flatMap((b) => b.booking.addon_service_ids || []) // Get all IDs
        .filter((id) => id != null); // Remove any nulls

      const uniqueAddonIds = [...new Set(allAddonIds)]; // Get unique IDs

      // Step 5: Fetch details for these add-on pricing IDs
      const addonDetails = uniqueAddonIds.length
        ? await db
          .select({
            pricing_id: ServicePricingsModel.id,
            service_name: ServicesModel.service_name,
            price: ServicePricingsModel.discounted_price, // Or .mrp
            pet_size: ServicePricingsModel.pet_size,
            service_id: ServicesModel.id,
          })
          .from(ServicePricingsModel)
          .leftJoin(
            ServicesModel,
            eq(ServicePricingsModel.service_id, ServicesModel.id)
          )
          .where(
            and(
              inArray(ServicePricingsModel.id, uniqueAddonIds)
            )
          )
        : [];

      // Step 6: Create a fast lookup map for the add-on details
      const addonsMap = addonDetails.reduce((acc, addon) => {
        acc[addon.pricing_id] = addon;
        return acc;
      }, {});

      // Step 7: Attach add-on details to each booking
      const finalResult = result.map((b) => ({
        ...b,
        address: b.address, // Ensure address is preserved in final result
        addon_services: (b.booking.addon_service_ids || [])
          .map((id) => addonsMap[id]) // Find the details for each ID
          .filter(Boolean), // Filter out any that weren't found
      }));

      // -----------------------------------------------------------------
      // ✨ END: NEW CODE
      // -----------------------------------------------------------------

      return res.status(200).json({
        message: 'Bookings fetched successfully',
        data: finalResult, // ✨ UPDATED: Send finalResult instead of result
        pagination: {
          totalRecords: total,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('❌ Failed to fetch all bookings (admin):', error);
      return res.status(500).json({
        message: error.message || 'Internal Server Error',
      });
    }
  }


  static async assign_groomer(req, res) {
    try {
      const { id } = req.params;
      const { groomer_id } = req.body;

      if (!id) throw new Error("Booking ID is required.");
      if (!groomer_id) throw new Error("Groomer ID is required.");

      // Check if groomer exists
      const [groomer] = await db
        .select()
        .from(GroomersModel)
        .where(eq(GroomersModel.id, groomer_id))
        .limit(1);

      if (!groomer) {
        return res.status(404).json({ message: "Groomer not found." });
      }

      // Get target booking's appointment time slot
      // const [targetBooking] = await db
      //   .select()
      //   .from(BookingsModel)
      //   .where(eq(BookingsModel.id, id))
      //   .limit(1);
      const [targetBooking] = await db
        .select({
          booking: BookingsModel,
          customer_name: CustomersModel.customer_name,
          pet_name: PetsModel.pet_name,
          service_name: ServicesModel.service_name,
          address: AddressesModel.full_address,
        })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(eq(BookingsModel.id, id))
        .limit(1);


      if (!targetBooking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const targetSlot = targetBooking.booking?.appointment_time_slot;
      if (!targetSlot) {
        return res.status(400).json({ message: "Target booking has no appointment time slot." });
      }

      const twoHoursInMs = 2 * 60 * 60 * 1000;
      const targetTime = new Date(targetSlot).getTime();
      const startWindow = new Date(targetTime - twoHoursInMs);
      const endWindow = new Date(targetTime + twoHoursInMs);

      // Check for conflicts within ±2 hours
      const [conflict] = await db
        .select()
        .from(BookingsModel)
        .where(
          and(
            eq(BookingsModel.delete, false),
            eq(BookingsModel.groomer_id, groomer_id),
            sql`${BookingsModel.id} != ${id}`,
            gte(BookingsModel.appointment_time_slot, startWindow),
            lte(BookingsModel.appointment_time_slot, endWindow)
          )
        )
        .limit(1);

      if (conflict) {
        return res.status(400).json({
          message:
            "This groomer is already assigned to another booking at current time slot.",
        });
      }

      const startotp = BookingsController.generateOTP();
      const endotp = BookingsController.generateOTP();

      const [updatedBooking] = await db
        .update(BookingsModel)
        .set({
          groomer_id: groomer_id,
          start_otp: startotp,
          end_otp: endotp,
          updatedat: new Date(),
        })
        .where(eq(BookingsModel.id, id))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // Send email to the new groomer
      const formattedTime = formatDateTimeCustom(targetSlot);
      await sendMail(
        groomer.email_id,
        "New Booking Assigned",
        'You have been assigned a new booking. Please login to your panel and check.',
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2a9d8f;">New Booking Assigned</h2>
            <p>Hello <strong>${groomer.groomer_name}</strong>,</p>
            <p>You have been assigned a new booking. Please find the details below:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Appointment Time</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Customer Name</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Pet Name</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Service</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${formattedTime}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${targetBooking.customer_name || 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${targetBooking.pet_name || 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${targetBooking.service_name || 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${targetBooking.address || 'N/A'}</td>
                </tr>
              </tbody>
            </table>

            <p style="margin-top: 20px;">
              Please be prepared at the scheduled time.
            </p>

            <p>Regards,<br/><strong>BhaoBhao Team</strong></p>
          </div>
        `,
      );

      const previousGroomerId = targetBooking.booking?.groomer_id;

      if (previousGroomerId && previousGroomerId !== groomer_id) {
        const [previousGroomer] = await db
          .select()
          .from(GroomersModel)
          .where(eq(GroomersModel.id, previousGroomerId))
          .limit(1);

        if (previousGroomer && previousGroomer.email_id) {
          await sendMail(
            previousGroomer.email_id,
            "Booking Assigned to You Cancelled",
            `The booking originally scheduled on <strong>${formattedTime}</strong> has been reassigned to another groomer.`,
            `
              <h2>Booking Assignment Cancelled</h2>
              <p>Dear ${previousGroomer.groomer_name},</p>
              <p>The booking originally scheduled on <strong>${formattedTime}</strong> has been reassigned to another groomer.</p>
              <p><strong>Booking Details:</strong></p>
              <ul>
                <li><strong>Pet Name:</strong> ${targetBooking.pet_name}</li>
                <li><strong>Service:</strong> ${targetBooking.service_name}</li>
                <li><strong>Address:</strong> ${targetBooking.address}</li>
              </ul>
              <p>Please adjust your schedule accordingly.</p>
              <p>Thank you for your service.</p>
            `,
          );
        }
      }



      return res.status(200).json({
        message: "Groomer assigned successfully.",
        start_otp: startotp,
        end_otp: endotp,
      });
    } catch (error) {
      console.error("❌ Failed to assign groomer:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
  static async groomerBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const groomerId = req.user?.userId;
      if (!groomerId) {
        return res.status(401).json({ message: "Unauthorized: Groomer not found in token" });
      }

      const status = req.query.status || "all"; // "all" | "Scheduled" | "In Progress" | "Completed"

      // Base conditions
      let conditions = [
        eq(BookingsModel.delete, false),
      ];

      if (process.env.PORTFOLIO_DEMO_MODE !== "true") {
        conditions.push(eq(BookingsModel.groomer_id, groomerId));
      }

      // Apply status filter
      if (status !== "all") {
        conditions.push(eq(BookingsModel.status, status));
      }

      // Step 1: Count total
      const totalResult = await db
        .select({ total: sql`count(*)` })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingsModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions));

      const total = parseInt(totalResult[0]?.total || 0, 10);

      // Step 2: Fetch paginated bookings
      const bookings = await db
        .select({
          customer: CustomersModel,
          booking: BookingsModel,
          pet: PetsModel,
          pet_type: PetTypesModel,
          pet_breed: PetBreedsModel,
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(PetsModel, eq(BookingsModel.pet_id, PetsModel.id))
        .leftJoin(PetTypesModel, eq(PetsModel.pet_type_id, PetTypesModel.id))
        .leftJoin(PetBreedsModel, eq(PetsModel.breed_id, PetBreedsModel.id))
        .leftJoin(ServicesModel, eq(BookingsModel.service_id, ServicesModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingsModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions))
        .orderBy(desc(BookingsModel.id))
        .limit(limit)
        .offset(offset);

      const bookingIds = bookings.map(b => b.booking.id);

      // Step 3: Fetch transactions
      const transactions = bookingIds.length
        ? await db
          .select()
          .from(TransactionsModel)
          .where(
            and(
              eq(TransactionsModel.delete, false),
              inArray(TransactionsModel.booking_id, bookingIds)
            )
          )
        : [];

      // Step 4: Map transactions
      const transactionsByBooking = transactions.reduce((acc, txn) => {
        if (!acc[txn.booking_id]) acc[txn.booking_id] = [];
        acc[txn.booking_id].push(txn);
        return acc;
      }, {});

      const result = bookings.map(b => ({
        ...b,
        transactions: transactionsByBooking[b.booking.id] || [],
      }));

      // -----------------------------------------------------------------
      // ✨ START: NEW CODE TO FETCH ADD-ON DETAILS
      // -----------------------------------------------------------------

      // Step 5: Get all unique add-on IDs from all bookings
      const allAddonIds = result
        .flatMap((b) => b.booking.addon_service_ids || []) // Get all IDs
        .filter((id) => id != null); // Remove any nulls

      const uniqueAddonIds = [...new Set(allAddonIds)]; // Get unique IDs

      // Step 6: Fetch details for these add-on pricing IDs
      const addonDetails = uniqueAddonIds.length
        ? await db
          .select({
            pricing_id: ServicePricingsModel.id,
            service_name: ServicesModel.service_name,
            price: ServicePricingsModel.discounted_price, // Or .mrp
            pet_size: ServicePricingsModel.pet_size,
            service_id: ServicesModel.id,
          })
          .from(ServicePricingsModel)
          .leftJoin(
            ServicesModel,
            eq(ServicePricingsModel.service_id, ServicesModel.id)
          )
          .where(
            and(
              inArray(ServicePricingsModel.id, uniqueAddonIds)
            )
          )
        : [];

      // Step 7: Create a fast lookup map for the add-on details
      const addonsMap = addonDetails.reduce((acc, addon) => {
        acc[addon.pricing_id] = addon;
        return acc;
      }, {});

      // Step 8: Attach add-on details to each booking
      const finalResult = result.map((b) => ({
        ...b,
        addon_services: (b.booking.addon_service_ids || [])
          .map((id) => addonsMap[id]) // Find the details for each ID
          .filter(Boolean), // Filter out any that weren't found
      }));

      // -----------------------------------------------------------------
      // ✨ END: NEW CODE
      // -----------------------------------------------------------------

      return res.status(200).json({
        data: finalResult, // ✨ UPDATED: Send finalResult instead of result
        pagination: {
          totalRecords: total,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch groomer bookings:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  static async start_booking(req, res) {
    try {
      const groomerId = req.user?.userId;

      if (!groomerId) {
        return res.status(401).json({ message: "Unauthorized: Groomer not found in token" });
      }

      const { id } = req.params;
      const { start_otp: entered_startotp } = req.body;

      if (!id) throw new Error("Booking ID is required.");
      if (!entered_startotp) throw new Error("Start OTP is required.");

      // ✅ Fetch booking
      const [booking] = await db
        .select()
        .from(BookingsModel)
        .where(eq(BookingsModel.id, id))
        .limit(1);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // ✅ Validate groomer assignment
      if (booking.groomer_id !== groomerId) {
        return res.status(403).json({ message: "Forbidden: This booking is not assigned to you." });
      }

      // ✅ Check if booking date is today
      const bookingDate = new Date(booking.appointment_time_slot);
      const now = new Date();

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      if (!(bookingDate >= startOfToday && bookingDate < endOfToday)) {
        return res.status(400).json({ message: "Booking can only be started on its scheduled day." });
      }


      // ✅ Validate entered OTP
      if (parseInt(entered_startotp) !== parseInt(booking.start_otp)) {
        return res.status(400).json({ message: "Invalid start OTP." });
      }

      // ✅ Mark booking as started
      const [updatedBooking] = await db
        .update(BookingsModel)
        .set({
          status: 'In Progress',
          start_time: new Date(),
          updatedat: new Date(),
        })
        .where(eq(BookingsModel.id, id))
        .returning();

      return res.status(200).json({
        message: "Service started successfully.",
      });
    } catch (error) {
      console.error("❌ Failed to start booking:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }

  static async complete_booking(req, res) {
    try {
      const { id } = req.params;
      const { end_otp: entered_endotp } = req.body;

      if (!id) throw new Error("Booking ID is required.");
      if (!entered_endotp) throw new Error("End OTP is required.");

      // ✅ Get groomerId from authenticated user
      const groomerId = req.user?.userId;
      if (!groomerId) {
        return res.status(401).json({ message: "Unauthorized: Groomer not found in token" });
      }

      // ✅ Fetch booking
      const [booking] = await db
        .select()
        .from(BookingsModel)
        .where(eq(BookingsModel.id, id))
        .limit(1);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      // ✅ Validate groomer assignment
      if (booking.groomer_id !== groomerId) {
        return res.status(403).json({ message: "Forbidden: This booking is not assigned to you." });
      }

      // ✅ Validate end OTP
      if (parseInt(entered_endotp) !== parseInt(booking.end_otp)) {
        return res.status(400).json({ message: "Invalid end OTP." });
      }

      // ✅ Mark booking as completed
      const [updatedBooking] = await db
        .update(BookingsModel)
        .set({
          status: 'Completed',
          end_time: new Date(),
          updatedat: new Date(),
        })
        .where(eq(BookingsModel.id, id))
        .returning();

      return res.status(200).json({
        message: "Service completed successfully.",
      });

    } catch (error) {
      console.error("❌ Failed to complete booking:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }

  // static async get_booked_time_slots(req, res) {
  //   try {
  //     const now = new Date();

  //     const bookedSlots = await db
  //       .select({
  //         id: BookingsModel.id,
  //         appointment_time_slot: BookingsModel.appointment_time_slot,
  //       })
  //       .from(BookingsModel)
  // eq(BookingsModel.delete, false)

  //       .where(gte(BookingsModel.appointment_time_slot, now))
  //       .orderBy(BookingsModel.appointment_time_slot);

  //     return res.status(200).json({
  //       message: "Booked time slots retrieved successfully.",
  //       data: bookedSlots,
  //     });
  //   } catch (error) {
  //     console.error("❌ Failed to retrieve booked time slots:", error);
  //     return res
  //       .status(500)
  //       .json({ message: error.message || "Internal Server Error" });
  //   }
  // };


}

export default BookingsController;
