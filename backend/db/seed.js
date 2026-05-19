// backend/db/seed.js
import { db } from "./index.js";
import { customers as CustomersModel } from "./schema/customers.js";
import { groomers as GroomersModel } from "./schema/groomers.js";
import { services as ServicesModel } from "./schema/services.js";
import { pets as PetsModel } from "./schema/pets.js";
import { bookings as BookingsModel } from "./schema/bookings.js";
import { addresses as AddressesModel } from "./schema/addresses.js";
import { users as UsersModel } from "./schema/users.js";

const seed = async () => {
  console.log("🌱 Starting Safe Database Seeding...");

  try {
    // ⚠️ 1. Clear ONLY the bookings table to ensure we start with exactly our 5 mock bookings
    console.log("🧹 Clearing old bookings from the database...");
    await db.delete(BookingsModel);

    // 2. Resolve Customer
    console.log("👤 Resolving Customer...");
    let customer = await db.query.customers.findFirst();
    let customerId;
    let customerName = "Alex Mercer";
    
    if (!customer) {
      console.log("⚠️ No customer found. Creating fallback customer...");
      // Ensure user exists first
      let user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.mobile_number, "9876543210")
      });
      let userId;
      if (!user) {
        const [newUser] = await db.insert(UsersModel).values({
          mobile_number: "9876543210",
          email_id: "customer@bhaobhao.in",
          user_name: "Customer_Demo",
          status: "Active",
        }).returning();
        userId = newUser.id;
      } else {
        userId = user.id;
      }

      const [newCustomer] = await db.insert(CustomersModel).values({
        user_id: userId,
        customer_name: customerName,
        gender: "Male",
        mobile_number: "9876543210",
        profile_photo: [],
      }).returning();
      customerId = newCustomer.id;
    } else {
      customerId = customer.id;
      customerName = customer.customer_name;
    }

    // 3. Resolve Address
    console.log("📍 Resolving Address...");
    let address = await db.query.addresses.findFirst();
    let addressId;
    if (!address) {
      console.log("⚠️ No address found. Creating fallback address...");
      const [newAddress] = await db.insert(AddressesModel).values({
        customer_id: customerId,
        flat_no: "Suite 404",
        area: "Indiranagar",
        landmark: "Metro Station",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560038",
        address_type: "Home",
      }).returning();
      addressId = newAddress.id;
    } else {
      addressId = address.id;
    }

    // 4. Resolve Pet
    console.log("🐾 Resolving Pet...");
    let pet = await db.query.pets.findFirst();
    let petId;
    if (!pet) {
      console.log("⚠️ No pet found. Creating fallback pet...");
      const [newPet] = await db.insert(PetsModel).values({
        customer_id: customerId,
        pet_name: "Buddy",
        pet_gender: "Male",
        nature: "Friendly",
        health_conditions: "Healthy",
        pet_type_id: 1,
        breed_id: 1,
        owner_name: customerName,
      }).returning();
      petId = newPet.id;
    } else {
      petId = pet.id;
    }

    // 5. Resolve Groomer
    console.log("✂️ Resolving Groomer...");
    let groomer = await db.query.groomers.findFirst();
    let groomerId;
    if (!groomer) {
      console.log("⚠️ No groomer found. Creating fallback groomer...");
      const [newGroomer] = await db.insert(GroomersModel).values({
        groomer_name: "John Doe",
        gender: "Male",
        email_id: "groomer1@bhaobhao.in",
        mobile_number: "9663176108",
        level: "Senior",
        profile_image: [],
      }).returning();
      groomerId = newGroomer.id;
    } else {
      groomerId = groomer.id;
    }

    // 6. Resolve Service
    console.log("🧩 Resolving Service...");
    let service = await db.query.services.findFirst();
    let serviceId;
    if (!service) {
      console.log("⚠️ No service found. Creating fallback service...");
      const [newService] = await db.insert(ServicesModel).values({
        service_name: "Bath & Blow Dry",
        category_id: 1,
        sub_category_id: 1,
        priority: "1",
      }).returning();
      serviceId = newService.id;
    } else {
      serviceId = service.id;
    }

    // 7. Seed EXACTLY 5 high-fidelity demo bookings
    console.log("📅 Seeding exactly 5 Portfolio Mock Bookings...");
    
    // Booking 1: Past Completed
    await db.insert(BookingsModel).values({
      id: 1,
      order_id: "ORD-BB-2026-001",
      customer_id: customerId,
      groomer_id: groomerId,
      pet_id: petId,
      address_id: addressId,
      service_id: serviceId,
      appointment_time_slot: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      status: "Completed",
      amount: 1200.00,
      total: 1200.00,
      start_otp: "482012",
      end_otp: "902148",
      createdat: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      updatedat: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    });

    // Booking 2: Past Completed
    await db.insert(BookingsModel).values({
      id: 2,
      order_id: "ORD-BB-2026-002",
      customer_id: customerId,
      groomer_id: groomerId,
      pet_id: petId,
      address_id: addressId,
      service_id: serviceId,
      appointment_time_slot: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      status: "Completed",
      amount: 1200.00,
      total: 1200.00,
      start_otp: "338902",
      end_otp: "776211",
      createdat: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updatedat: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    });

    // Booking 3: Past Completed
    await db.insert(BookingsModel).values({
      id: 3,
      order_id: "ORD-BB-2026-003",
      customer_id: customerId,
      groomer_id: groomerId,
      pet_id: petId,
      address_id: addressId,
      service_id: serviceId,
      appointment_time_slot: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "Completed",
      amount: 1200.00,
      total: 1200.00,
      start_otp: "109823",
      end_otp: "542301",
      createdat: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedat: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    // Booking 4: Active Job (In Progress)
    await db.insert(BookingsModel).values({
      id: 4,
      order_id: "ORD-BB-2026-004",
      customer_id: customerId,
      groomer_id: groomerId,
      pet_id: petId,
      address_id: addressId,
      service_id: serviceId,
      appointment_time_slot: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "In Progress",
      amount: 1200.00,
      total: 1200.00,
      start_otp: "602511",
      end_otp: "891024",
      createdat: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedat: new Date(Date.now() - 2 * 60 * 60 * 1000)
    });

    // Booking 5: Upcoming Job (Scheduled)
    await db.insert(BookingsModel).values({
      id: 5,
      order_id: "ORD-BB-2026-005",
      customer_id: customerId,
      groomer_id: groomerId,
      pet_id: petId,
      address_id: addressId,
      service_id: serviceId,
      appointment_time_slot: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "Scheduled",
      amount: 1200.00,
      total: 1200.00,
      start_otp: "220149",
      end_otp: "448931",
      createdat: new Date(),
      updatedat: new Date()
    });

    console.log("🎉 Database Successfully Seeded with exactly 5 portfolio bookings!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Database Seeding Failed:", error);
    process.exit(1);
  }
};

seed();
