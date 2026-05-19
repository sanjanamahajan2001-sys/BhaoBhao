import { eq, sql, inArray, and, desc, lte, gte, gt, lt, or, ilike, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings as BookingsModel } from "../db/schema/bookings.js";
import { booking_services as BookingServicesModel } from "../db/schema/booking_services.js";
import { booking_service_pets as BookingServicePetsModel } from "../db/schema/booking_service_pets.js";
import { groomers as GroomersModel } from "../db/schema/groomers.js";
import { pets as PetsModel } from "../db/schema/pets.js";
import { pet_types as PetTypesModel } from "../db/schema/pet_types.js";
import { pet_breeds as PetBreedsModel } from "../db/schema/pet_breeds.js";
import { services as ServicesModel } from "../db/schema/services.js";
import { service_pricings as ServicePricingsModel } from "../db/schema/service_pricings.js";
import { addresses as AddressesModel } from "../db/schema/addresses.js";
import { customers as CustomersModel } from "../db/schema/customers.js";
import { transactions as TransactionsModel } from "../db/schema/transactions.js";
import { users as UsersModel } from "../db/schema/users.js";
import { sendMail } from "../utils/mailgun.js";
import { formatDateTimeCustom } from '../utils/formatDateTime.js';

class BookingsController {
  static getAdminEmails() {
    const raw = process.env.ADMIN_EMAIL || "";
    return raw
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }

  static async sendAdminBookingEmail({
    orderIds,
    customerName,
    customerEmail,
    customerPhone,
    customerGender,
    petName,
    petGender,
    petNature,
    petHealthConditions,
    petType,
    petBreed,
    petOwnerName,
    petDob,
    customerNotes,
    serviceName,
    appointmentTimes,
    bookedAt,
    address,
    paymentMethod,
    amountBeforeTax,
    taxAmount,
    totalAmount,
  }) {
    const adminEmails = BookingsController.getAdminEmails();
    if (adminEmails.length === 0) return;

    const bookingTime = formatDateTimeCustom(new Date());
    const bookedAtTime = bookedAt
      ? formatDateTimeCustom(bookedAt)
      : bookingTime;

    await sendMail(
      adminEmails.join(","),
      "New Booking Alert",
      "A customer just booked an appointment.",
      `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2a9d8f;">New Booking Alert</h2>
          <p>Hi Admin,</p>
          <p>Congratulations. The customer has booked an appointment just now. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${bookingTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${customerName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer gender:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${customerGender || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer email:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${customerEmail || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer phone:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${customerPhone || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booked at:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${bookedAtTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking appointment date and time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${appointmentTimes || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer address:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${address || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet type:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petType || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet breed:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petBreed || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet gender:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petGender || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet owner name:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petOwnerName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet DOB:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petDob || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet nature:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petNature || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Health conditions:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${petHealthConditions || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Service:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${serviceName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer notes:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${customerNotes || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID(s):</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${orderIds || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment method:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${paymentMethod || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount (before tax):</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${amountBeforeTax != null ? `₹ ${amountBeforeTax}/-` : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tax:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${taxAmount != null ? `₹ ${taxAmount}/-` : "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${totalAmount != null ? `₹ ${totalAmount}/-` : "N/A"}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Regards,<br/><strong>BhaoBhao Team</strong></p>
        </div>
      `
    );
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  static generateOrderId() {
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    return randomStr;
  }


  static async new_booking(req, res) {
    try {
      let IsNew = true;
      let bookingId = null;
      if (req.method == "PUT") {
        // this is update booking
        if (!req.params.id) {
          return res.status(400).json({ message: "Booking ID is required for update." });
        }
        IsNew = false;
        bookingId = req.params.id;
      }

      const customer_id = req.user.customerId;
      if (!customer_id) {
        throw new Error("Customer ID not found in user session.");
      }

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

        payment_method
      } = req.body;

      if (!Array.isArray(appointment_time_slots) || appointment_time_slots.length === 0) {
        throw new Error("At least one appointment time slot is required.");
      }

      const amount_db = parseFloat(amount);
      const tax_db = parseFloat(tax);
      const total_db = parseFloat(total);
      const orderId = BookingsController.generateOrderId();

      // Update the pet's nature
      await db.update(PetsModel).set({
        nature: nature || '',
        health_conditions: health_conditions || '',
        skin_condition: skin_condition || '',
        comments: comments || '',
      }).where(eq(PetsModel.id, pet_id));

      if (IsNew) {
        const inserted = await db.transaction(async (tx) => {
          const bookingValues = appointment_time_slots.map((slot, index) => ({
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
            // start_otp: BookingsController.generateOTP(),
            // end_otp: BookingsController.generateOTP(),
            notes: notes || null,
            order_id: orderId,
            payment_method: payment_method,
          }));

          return await tx.insert(BookingsModel).values(bookingValues).returning();
        });

        const [pet] = await db
          .select({
            pet_name: PetsModel.pet_name,
            pet_gender: PetsModel.pet_gender,
            nature: PetsModel.nature,
            health_conditions: PetsModel.health_conditions,
            pet_type_id: PetsModel.pet_type_id,
            breed_id: PetsModel.breed_id,
            owner_name: PetsModel.owner_name,
            pet_dob: PetsModel.pet_dob,
          })
          .from(PetsModel)
          .where(eq(PetsModel.id, pet_id))
          .limit(1);
        const [service] = await db
          .select({ service_name: ServicesModel.service_name })
          .from(ServicesModel)
          .where(eq(ServicesModel.id, service_id))
          .limit(1);
        const [address] = await db
          .select({ full_address: AddressesModel.full_address })
          .from(AddressesModel)
          .where(eq(AddressesModel.id, address_id))
          .limit(1);

        // Send email notification to customer
        const [customer] = await db
          .select({
            customer_name: CustomersModel.customer_name,
            gender: CustomersModel.gender,
            mobile_number: CustomersModel.mobile_number,
            email_id: UsersModel.email_id,
          })
          .from(CustomersModel)
          .leftJoin(UsersModel, eq(UsersModel.user_id, CustomersModel.id))
          .where(eq(CustomersModel.id, customer_id))
          .limit(1);

        const bookedAt =
          inserted && inserted.length > 0 ? inserted[0].createdat : new Date();
        const appointmentTimes = appointment_time_slots
          .map((slot) => formatDateTimeCustom(new Date(slot)))
          .join('<br>');

        if (customer && customer.email_id) {
          const customerEmail = customer.email_id;

          const bookingDateTimes = appointmentTimes;

          await sendMail(
            customerEmail,
            "Booking Confirmation",
            'Your Booking is Confirmed!',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #333;">🎉 Your Booking is Confirmed!</h2>
              <p>Dear <strong>${customer.customer_name || 'Customer'}</strong>,</p>
              <p>We are pleased to inform you that your booking has been successfully created with the following details:</p>

              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pet Name:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${pet.pet_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Service Name:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${service.service_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; vertical-align: top;"><strong>Appointment Time Slots:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${bookingDateTimes}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
                  <td style="padding: 8px; border: 1px solid #ddd;">₹ ${total}/-</td>
                </tr>
              </table>

              <p style="margin-top: 20px;">Please be prepared on the specified time slots to ensure a smooth service experience.</p>
              <p>Thank you for choosing BhaoBhao!</p>

              <div style="margin-top: 30px; font-size: 0.9em; color: #555;">
                Best regards,<br/>
                <strong>Team BhaoBhao</strong>
              </div>
            </div>
            `,
          );
        }

        const [petType] = pet?.pet_type_id
          ? await db
            .select({ name: PetTypesModel.name })
            .from(PetTypesModel)
            .where(eq(PetTypesModel.id, pet.pet_type_id))
            .limit(1)
          : [];
        const [petBreed] = pet?.breed_id
          ? await db
            .select({ breed_name: PetBreedsModel.breed_name })
            .from(PetBreedsModel)
            .where(eq(PetBreedsModel.id, pet.breed_id))
            .limit(1)
          : [];

        await BookingsController.sendAdminBookingEmail({
          orderIds: orderId,
          customerName: customer?.customer_name,
          customerEmail: customer?.email_id,
          customerPhone: customer?.mobile_number,
          customerGender: customer?.gender,
          petName: pet?.pet_name,
          petGender: pet?.pet_gender,
          petNature: pet?.nature || nature,
          petHealthConditions: pet?.health_conditions || health_conditions,
          petType: petType?.name,
          petBreed: petBreed?.breed_name,
          petOwnerName: pet?.owner_name,
          petDob: pet?.pet_dob ? formatDateTimeCustom(pet.pet_dob) : undefined,
          customerNotes: notes,
          serviceName: service?.service_name,
          appointmentTimes,
          bookedAt,
          address: address?.full_address,
          paymentMethod: payment_method,
          amountBeforeTax: amount_db,
          taxAmount: tax_db,
          totalAmount: total_db,
        });

        return res.status(200).json({
          message: "Booking created successfully.",
          data: inserted,
          order_id: orderId
        });
      } else {
        const [updated] = await db
          .update(BookingsModel)
          .set({
            pet_id,
            service_id,
            service_pricing_id,
            address_id,
            pet_size,
            groomer_id: null,
            start_otp: null,
            end_otp: null,
            appointment_time_slot: new Date(appointment_time_slots[0]),
            amount: amount_db,
            tax: tax_db,
            total: total_db,
            notes: notes || null,
            payment_method,
            updatedat: new Date(),
          })
          .where(
            and(
              eq(BookingsModel.id, bookingId),
              eq(BookingsModel.customer_id, customer_id),
              eq(BookingsModel.status, 'Scheduled')
            )
          )
          .returning();

        if (!updated) {
          return res.status(404).json({ message: "Only scheduled bookings can be updated" });
        }

        return res.status(200).json({
          message: "Booking updated successfully.",
          data: updated,
        });
      }

    } catch (error) {
      console.error("❌ Failed to create bookings:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  static async save(req, res) {
    try {
      const IsNewBody = req.body.IsNew;
      let IsNew = true;
      if (!IsNewBody) {
        IsNew = false;
        if (!req.body.booking_id) {
          return res.status(400).json({ message: "Booking ID is required for update." });
        }
      }

      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const {
        booking_id: bookingId,
        address_id,
        groomer_id,
        slots,
        appointment_time_slot,
        notes,
        payment_method,
        services,
        pets, // pets update
      } = req.body;

      if (!services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ message: "At least one service is required." });
      }

      const totals = {
        amount: services.reduce((sum, s) => sum + parseFloat(s.amount), 0),
        tax: services.reduce((sum, s) => sum + parseFloat(s.tax), 0),
        total: services.reduce((sum, s) => sum + parseFloat(s.total), 0),
      };

      if (IsNew && (!slots || !Array.isArray(slots) || slots.length === 0)) {
        return res.status(400).json({ message: "At least one slot is required for new booking." });
      }

      const results = [];

      await db.transaction(async (tx) => {
        if (IsNew) {
          // --- MULTI-BOOKING CREATE ---
          for (const slot of slots) {
            const [inserted] = await tx
              .insert(BookingsModel)
              .values({
                order_id: BookingsController.generateOrderId(),
                customer_id,
                groomer_id: groomer_id || null,
                address_id,
                appointment_time_slot: new Date(slot),
                amount: totals.amount,
                tax: totals.tax,
                total: totals.total,
                notes: notes || null,
                payment_method: payment_method,
              })
              .returning();

            const bookingRow = inserted;

            // insert services & pets mapping
            const bookingServices = [];
            // for (const s of services) {
            //   const [svc] = await tx
            //     .insert(BookingServicesModel)
            //     .values({
            //       booking_id: bookingRow.id,
            //       service_pricing_id: s.service_pricing_id,
            //       amount: parseFloat(s.amount),
            //       tax: parseFloat(s.tax),
            //       total: parseFloat(s.total),
            //     })
            //     .returning();

            //   let servicePets = [];
            //   if (s.pets && Array.isArray(s.pets)) {
            //     const petRows = s.pets.map((petId) => ({
            //       booking_service_id: svc.id,
            //       pet_id: petId,
            //     }));
            //     if (petRows.length) {
            //       servicePets = await tx.insert(BookingServicePetsModel).values(petRows).returning();
            //     }
            //   }

            //   bookingServices.push({ ...svc, pets: servicePets });
            // }
            // inside tx after inserting bookingServices
            for (const s of services) {
              const [svc] = await tx
                .insert(BookingServicesModel)
                .values({
                  booking_id: bookingRow.id,
                  service_pricing_id: s.service_pricing_id,
                  parent_service_id: s.parent_service_id || null, // ✅ added this line
                  amount: parseFloat(s.amount),
                  tax: parseFloat(s.tax),
                  total: parseFloat(s.total),
                })
                .returning();



              // ✅ fetch service_pricing and its service
              const [pricing] = await tx
                .select()
                .from(ServicePricingsModel)
                .where(eq(ServicePricingsModel.id, s.service_pricing_id))
                .limit(1);

              let serviceObj = null;
              if (pricing) {
                const [svcObj] = await tx
                  .select()
                  .from(ServicesModel)
                  .where(eq(ServicesModel.id, pricing.service_id))
                  .limit(1);
                serviceObj = svcObj || null;
              }

              let servicePets = [];
              if (s.pets && Array.isArray(s.pets)) {
                const petRows = s.pets.map((petId) => ({
                  booking_service_id: svc.id,
                  pet_id: petId,
                }));
                if (petRows.length) {
                  servicePets = await tx.insert(BookingServicePetsModel).values(petRows).returning();

                  // ✅ attach actual pet objects
                  const petIds = servicePets.map((p) => p.pet_id);
                  const petObjects = petIds.length
                    ? await tx.select().from(PetsModel).where(inArray(PetsModel.id, petIds))
                    : [];
                  servicePets = servicePets.map((sp) => ({
                    ...sp,
                    pet: petObjects.find((po) => po.id === sp.pet_id) || null,
                  }));
                }
              }

              bookingServices.push({
                ...svc,
                service_pricing: pricing ? { ...pricing, service: serviceObj } : null,
                pets: servicePets,
              });
            }


            results.push({ ...bookingRow, booking_services: bookingServices });

            // --- SEND EMAIL TO CUSTOMER ---
            const [customer] = await tx
              .select({
                customer_name: CustomersModel.customer_name,
                gender: CustomersModel.gender,
                mobile_number: CustomersModel.mobile_number,
                email_id: UsersModel.email_id,
              })
              .from(CustomersModel)
              .leftJoin(UsersModel, eq(UsersModel.user_id, CustomersModel.id))
              .where(eq(CustomersModel.id, customer_id))
              .limit(1);

            if (customer && customer.email_id) {
              const orderIds = results.map((b) => b.order_id).join(', ');
              const bookingDateTimes = slots
                .map((slot) => formatDateTimeCustom(new Date(slot)))
                .join('<br>');

              // Collect pet names & service names for email
              const petIds = pets.map((p) => p.pet_id);
              const petObjects = await tx
                .select()
                .from(PetsModel)
                .where(inArray(PetsModel.id, petIds));
              const petNames = petObjects.map((p) => p.pet_name).join(', ');
              const petGenders = petObjects
                .map((p) => p.pet_gender)
                .filter(Boolean)
                .join(', ');
              const petNatures = petObjects
                .map((p) => p.nature)
                .filter(Boolean)
                .join(', ');
              const petHealthConditions = petObjects
                .map((p) => p.health_conditions)
                .filter(Boolean)
                .join(', ');
              const petTypeIds = petObjects
                .map((p) => p.pet_type_id)
                .filter(Boolean);
              const petBreedIds = petObjects
                .map((p) => p.breed_id)
                .filter(Boolean);
              const petTypes = petTypeIds.length
                ? await tx
                  .select({ id: PetTypesModel.id, name: PetTypesModel.name })
                  .from(PetTypesModel)
                  .where(inArray(PetTypesModel.id, petTypeIds))
                : [];
              const petBreeds = petBreedIds.length
                ? await tx
                  .select({
                    id: PetBreedsModel.id,
                    breed_name: PetBreedsModel.breed_name,
                  })
                  .from(PetBreedsModel)
                  .where(inArray(PetBreedsModel.id, petBreedIds))
                : [];
              const petTypeNames = petObjects
                .map(
                  (p) => petTypes.find((t) => t.id === p.pet_type_id)?.name
                )
                .filter(Boolean)
                .join(', ');
              const petBreedNames = petObjects
                .map(
                  (p) =>
                    petBreeds.find((b) => b.id === p.breed_id)?.breed_name
                )
                .filter(Boolean)
                .join(', ');
              const petOwnerNames = petObjects
                .map((p) => p.owner_name)
                .filter(Boolean)
                .join(', ');
              const petDobs = petObjects
                .map((p) =>
                  p.pet_dob ? formatDateTimeCustom(p.pet_dob) : null
                )
                .filter(Boolean)
                .join(', ');

              const serviceIds = services.map((s) => s.service_id);
              const serviceObjects = await tx.select().from(ServicesModel).where(inArray(ServicesModel.id, serviceIds));
              const serviceNames = serviceObjects.map((s) => s.service_name).join(', ');

              await sendMail(
                customer.email_id,
                "Booking Confirmation",
                "Your Booking is Confirmed!",
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="color: #333;">🎉 Your Booking is Confirmed!</h2>
                  <p>Dear <strong>${customer.customer_name || 'Customer'}</strong>,</p>
                  <p>Your booking has been successfully created:</p>
                  <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                      <td style="padding: 8px; border:1px solid #ddd;"><strong>Order ID:</strong></td>
                      <td style="padding: 8px; border:1px solid #ddd;">${orderIds}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border:1px solid #ddd;"><strong>Pet Name(s):</strong></td>
                      <td style="padding: 8px; border:1px solid #ddd;">${petNames}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border:1px solid #ddd;"><strong>Service(s):</strong></td>
                      <td style="padding: 8px; border:1px solid #ddd;">${serviceNames}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border:1px solid #ddd;"><strong>Appointment Time Slots:</strong></td>
                      <td style="padding: 8px; border:1px solid #ddd;">${bookingDateTimes}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border:1px solid #ddd;"><strong>Total Amount:</strong></td>
                      <td style="padding: 8px; border:1px solid #ddd;">₹ ${totals.total}/-</td>
                    </tr>
                  </table>
                  <p style="margin-top:20px;">Please be prepared on the specified time slots to ensure a smooth service experience.</p>
                  <p>Thank you for choosing BhaoBhao!</p>
                  <div style="margin-top:30px; font-size:0.9em; color:#555;">
                    Best regards,<br/>
                    <strong>Team BhaoBhao</strong>
                  </div>
                </div>
                `
              );
            }

            const [address] = await tx
              .select({ full_address: AddressesModel.full_address })
              .from(AddressesModel)
              .where(eq(AddressesModel.id, address_id))
              .limit(1);

            const bookedAt =
              results.length > 0 ? results[0].createdat : new Date();

            await BookingsController.sendAdminBookingEmail({
              orderIds: results.map((b) => b.order_id).join(', '),
              customerName: customer?.customer_name,
              customerEmail: customer?.email_id,
              customerPhone: customer?.mobile_number,
              customerGender: customer?.gender,
              petName: petNames,
              petGender: petGenders,
              petNature: petNatures,
              petHealthConditions: petHealthConditions,
              petType: petTypeNames,
              petBreed: petBreedNames,
              petOwnerName: petOwnerNames,
              petDob: petDobs,
              customerNotes: notes,
              serviceName: serviceNames,
              appointmentTimes: bookingDateTimes,
              bookedAt,
              address: address?.full_address,
              paymentMethod: payment_method,
              amountBeforeTax: totals.amount,
              taxAmount: totals.tax,
              totalAmount: totals.total,
            });

          }
        } else {
          // --- UPDATE FLOW ---
          const [existing] = await tx
            .select()
            .from(BookingsModel)
            .where(
              and(
                eq(BookingsModel.id, bookingId),
                eq(BookingsModel.customer_id, customer_id),
                eq(BookingsModel.status, "Scheduled"),
                eq(BookingsModel.delete, false)
              )
            );

          if (!existing) throw new Error("Booking not found or not editable.");

          const [updated] = await tx
            .update(BookingsModel)
            .set({
              groomer_id: groomer_id || null,
              address_id,
              appointment_time_slot: new Date(appointment_time_slot),
              amount: totals.amount,
              tax: totals.tax,
              total: totals.total,
              notes: notes || null,
              payment_method: payment_method || "COD",
              updatedat: new Date(),
            })
            .where(eq(BookingsModel.id, bookingId))
            .returning();

          // cleanup old children
          await tx
            .delete(BookingServicePetsModel)
            .where(
              inArray(
                BookingServicePetsModel.booking_service_id,
                tx
                  .select({ id: BookingServicesModel.id })
                  .from(BookingServicesModel)
                  .where(eq(BookingServicesModel.booking_id, bookingId))
              )
            );
          await tx.delete(BookingServicesModel).where(eq(BookingServicesModel.booking_id, bookingId));

          // re-insert services & pets
          const bookingServices = [];
          for (const s of services) {
            const [svc] = await tx
              .insert(BookingServicesModel)
              .values({
                booking_id: updated.id,
                service_pricing_id: s.service_pricing_id,
                amount: parseFloat(s.amount),
                tax: parseFloat(s.tax),
                total: parseFloat(s.total),
              })
              .returning();

            let servicePets = [];
            if (s.pets && Array.isArray(s.pets)) {
              const petRows = s.pets.map((petId) => ({
                booking_service_id: svc.id,
                pet_id: petId,
              }));
              if (petRows.length) {
                servicePets = await tx.insert(BookingServicePetsModel).values(petRows).returning();
              }
            }

            bookingServices.push({ ...svc, pets: servicePets });
          }

          results.push({ ...updated, booking_services: bookingServices });
        }

        // ✅ Update pets model
        if (pets && Array.isArray(pets) && pets.length > 0) {
          for (const p of pets) {
            await tx
              .update(PetsModel)
              .set({
                nature: p.nature || null,
                health_conditions: p.health_conditions || null,
                skin_condition: p.skin_condition || null,
                comments: p.comments || null,
                updatedat: new Date(),
              })
              .where(and(eq(PetsModel.id, p.pet_id), eq(PetsModel.customer_id, customer_id)));
          }
        }
      });

      return res.status(200).json({
        message: IsNew
          ? `Booking(s) created successfully (${results.length} slot${results.length > 1 ? "s" : ""}).`
          : "Booking updated successfully.",
        data: IsNew ? results : results[0],
      });
    } catch (error) {
      console.error("❌ Failed to save booking:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }



  static async upcoming_bookings(req, res) {
    try {
      const customer_id = req.user?.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      const now = new Date();

      // Step 1: Fetch upcoming bookings
      const upcomingBookingRows = await db
        .select({
          booking: BookingsModel,
          groomer: GroomersModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
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
        .limit(5); // next 5 bookings

      if (!upcomingBookingRows.length) {
        return res.status(200).json({ data: [] });
      }

      // Step 2: Fetch booking_services → service_pricing → services
      const bookingIds = upcomingBookingRows.map(b => b.booking.id);
      const bookingServices = await db
        .select({
          booking_service: BookingServicesModel,
          service_pricing: ServicePricingsModel,
          service: ServicesModel,
        })
        .from(BookingServicesModel)
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
        .where(inArray(BookingServicesModel.booking_id, bookingIds));

      // Step 3: Fetch pets for each booking_service
      const bookingServiceIds = bookingServices.map(bs => bs.booking_service.id);
      const servicePets = bookingServiceIds.length
        ? await db
          .select()
          .from(BookingServicePetsModel)
          .where(inArray(BookingServicePetsModel.booking_service_id, bookingServiceIds))
        : [];

      // Step 4: Map pets to each booking_service
      const servicePetsByService = servicePets.reduce((acc, sp) => {
        if (!acc[sp.booking_service_id]) acc[sp.booking_service_id] = [];
        acc[sp.booking_service_id].push(sp);
        return acc;
      }, {});

      const bookingServicesWithPets = bookingServices.map(bs => ({
        ...bs,
        pets: servicePetsByService[bs.booking_service.id] || [],
      }));

      // Step 5: Map booking_services to their booking
      const bookingServicesByBooking = bookingServicesWithPets.reduce((acc, bs) => {
        if (!acc[bs.booking_service.booking_id]) acc[bs.booking_service.booking_id] = [];
        acc[bs.booking_service.booking_id].push(bs);
        return acc;
      }, {});

      // Step 6: Attach booking_services to each booking
      const result = upcomingBookingRows.map(b => ({
        ...b,
        booking_services: bookingServicesByBooking[b.booking.id] || [],
      }));

      return res.status(200).json({ data: result });
    } catch (error) {
      console.error("❌ Failed to fetch upcoming bookings:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }


  static async last_booking(req, res) {
    try {
      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      // Step 1: Fetch the latest booking
      const latestBookingRows = await db
        .select({
          booking: BookingsModel,
          groomer: GroomersModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(
          and(
            eq(BookingsModel.customer_id, customer_id),
            eq(BookingsModel.delete, false)
          )
        )
        .orderBy(desc(BookingsModel.appointment_time_slot))
        .limit(1);

      const latestBooking = latestBookingRows[0];
      if (!latestBooking) {
        return res.status(200).json({ data: null });
      }

      // Step 2: Fetch services & service_pricing for this booking
      const bookingServices = await db
        .select({
          booking_service: BookingServicesModel,
          service_pricing: ServicePricingsModel,
          service: ServicesModel,
        })
        .from(BookingServicesModel)
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
        .where(eq(BookingServicesModel.booking_id, latestBooking.booking.id));

      // Step 3: Fetch pets for each booking_service
      const bookingServiceIds = bookingServices.map(bs => bs.booking_service.id);
      const servicePets = bookingServiceIds.length
        ? await db
          .select()
          .from(BookingServicePetsModel)
          .where(inArray(BookingServicePetsModel.booking_service_id, bookingServiceIds))
        : [];

      // Step 4: Map pets to their respective booking_service
      const servicePetsByService = servicePets.reduce((acc, sp) => {
        if (!acc[sp.booking_service_id]) acc[sp.booking_service_id] = [];
        acc[sp.booking_service_id].push(sp);
        return acc;
      }, {});

      const bookingServicesWithPets = bookingServices.map(bs => ({
        ...bs,
        pets: servicePetsByService[bs.booking_service.id] || [],
      }));

      // Step 5: Return structured object
      return res.status(200).json({
        data: {
          ...latestBooking,
          booking_services: bookingServicesWithPets,
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch latest booking:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }


  static async list(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const upcomingPast = req.query.upcomingPast || "all";
      const search = req.query.search?.trim() || null;

      const customer_id = req.user.customerId;
      if (!customer_id) throw new Error("Customer ID not found in user session.");

      // Base conditions
      const conditions = [
        eq(BookingsModel.customer_id, customer_id),
        eq(BookingsModel.delete, false),
      ];

      if (upcomingPast === "upcoming") conditions.push(gt(BookingsModel.appointment_time_slot, sql`NOW()`));
      else if (upcomingPast === "past") conditions.push(lt(BookingsModel.appointment_time_slot, sql`NOW()`));

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

      // Count total bookings
      const totalResult = await db
        .select({ total: sql`count(distinct ${BookingsModel.id})` })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(BookingServicesModel, eq(BookingServicesModel.booking_id, BookingsModel.id))
        .leftJoin(BookingServicePetsModel, eq(BookingServicePetsModel.booking_service_id, BookingServicesModel.id))
        .leftJoin(PetsModel, eq(BookingServicePetsModel.pet_id, PetsModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id)) // ✅ Corrected join
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions));

      const total = Number(totalResult[0]?.total || 0);

      // Fetch bookings with pagination
      const allBookings = await db
        .select({
          booking: BookingsModel,
          groomer: GroomersModel,
          pet: PetsModel,
          service_pricing: ServicePricingsModel,
          service: ServicesModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(BookingServicesModel, eq(BookingServicesModel.booking_id, BookingsModel.id))
        .leftJoin(BookingServicePetsModel, eq(BookingServicePetsModel.booking_service_id, BookingServicesModel.id))
        .leftJoin(PetsModel, eq(BookingServicePetsModel.pet_id, PetsModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id)) // ✅ Corrected join
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions))
        .orderBy(desc(BookingsModel.id))
        .limit(limit)
        .offset(offset);

      const bookingIds = allBookings.map(b => b.booking.id);

      const transactions = bookingIds.length
        ? await db.select().from(TransactionsModel)
          .where(and(eq(TransactionsModel.delete, false), inArray(TransactionsModel.booking_id, bookingIds)))
        : [];

      const transactionsByBooking = transactions.reduce((acc, txn) => {
        if (!acc[txn.booking_id]) acc[txn.booking_id] = [];
        acc[txn.booking_id].push(txn);
        return acc;
      }, {});

      const result = allBookings.map(b => ({
        ...b,
        transactions: transactionsByBooking[b.booking.id] || [],
      }));

      return res.status(200).json({
        data: result,
        pagination: {
          totalRecords: total,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch bookings:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
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

  static async adminAllBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { status = "all", search = "" } = req.query;

      // ✅ Base condition
      let whereConditions = [eq(BookingsModel.delete, false)];

      // ✅ Status filter
      if (status && status !== "all") {
        whereConditions.push(eq(BookingsModel.status, status));
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

      // Step 1: Count total unique bookings
      const totalResult = await db
        .select({ total: sql`count(distinct ${BookingsModel.id})` })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(BookingServicesModel, eq(BookingServicesModel.booking_id, BookingsModel.id))
        .leftJoin(BookingServicePetsModel, eq(BookingServicePetsModel.booking_service_id, BookingServicesModel.id))
        .leftJoin(PetsModel, eq(BookingServicePetsModel.pet_id, PetsModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
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
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(GroomersModel, eq(BookingsModel.groomer_id, GroomersModel.id))
        .leftJoin(BookingServicesModel, eq(BookingServicesModel.booking_id, BookingsModel.id))
        .leftJoin(BookingServicePetsModel, eq(BookingServicePetsModel.booking_service_id, BookingServicesModel.id))
        .leftJoin(PetsModel, eq(BookingServicePetsModel.pet_id, PetsModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(finalWhere)
        .orderBy(desc(BookingsModel.id))
        .limit(limit)
        .offset(offset);

      const bookingIds = allBookings.map(b => b.booking.id);

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

      const transactionsByBooking = transactions.reduce((acc, txn) => {
        if (!acc[txn.booking_id]) acc[txn.booking_id] = [];
        acc[txn.booking_id].push(txn);
        return acc;
      }, {});

      const result = allBookings.map(b => ({
        ...b,
        transactions: transactionsByBooking[b.booking.id] || [],
      }));

      return res.status(200).json({
        message: "Bookings fetched successfully",
        data: result,
        pagination: {
          totalRecords: total,
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ Failed to fetch all bookings (admin):", error);
      return res.status(500).json({
        message: error.message || "Internal Server Error",
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
        eq(BookingsModel.groomer_id, groomerId),
      ];

      // Apply status filter
      if (status !== "all") {
        conditions.push(eq(BookingsModel.status, status));
      }

      // Step 1: Count total unique bookings
      const totalResult = await db
        .select({ total: sql`count(distinct ${BookingsModel.id})` })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(BookingServicesModel, eq(BookingServicesModel.booking_id, BookingsModel.id))
        .leftJoin(BookingServicePetsModel, eq(BookingServicePetsModel.booking_service_id, BookingServicesModel.id))
        .leftJoin(PetsModel, eq(BookingServicePetsModel.pet_id, PetsModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
        .leftJoin(AddressesModel, eq(BookingsModel.address_id, AddressesModel.id))
        .where(and(...conditions));

      const total = parseInt(totalResult[0]?.total || 0, 10);

      // Step 2: Fetch paginated bookings
      const bookings = await db
        .select({
          customer: CustomersModel,
          booking: BookingsModel,
          pet: PetsModel,
          service: ServicesModel,
          service_pricing: ServicePricingsModel,
          address: AddressesModel,
        })
        .from(BookingsModel)
        .leftJoin(CustomersModel, eq(BookingsModel.customer_id, CustomersModel.id))
        .leftJoin(BookingServicesModel, eq(BookingServicesModel.booking_id, BookingsModel.id))
        .leftJoin(BookingServicePetsModel, eq(BookingServicePetsModel.booking_service_id, BookingServicesModel.id))
        .leftJoin(PetsModel, eq(BookingServicePetsModel.pet_id, PetsModel.id))
        .leftJoin(ServicePricingsModel, eq(BookingServicesModel.service_pricing_id, ServicePricingsModel.id))
        .leftJoin(ServicesModel, eq(ServicePricingsModel.service_id, ServicesModel.id))
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

      // Step 5: Attach transactions
      const result = bookings.map(b => ({
        ...b,
        transactions: transactionsByBooking[b.booking.id] || [],
      }));

      return res.status(200).json({
        data: result,
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
