import { eq, and, gte, isNull, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { users as UsersModel} from "../db/schema/users.js";
import { customers as CustomersModel} from "../db/schema/customers.js";
import { groomers as GroomersModel} from "../db/schema/groomers.js";
import { otpChallenges as OtpChallengesModel} from "../db/schema/otp_challenges.js";
import OtpsModel from "../db/schema/otps.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailgun.js";
import crypto from "crypto";
import { adminTokenVersion, incrementAdminTokenVersion } from "../utils/adminToken.js";
import bcrypt from 'bcrypt';
import { verifyOtpSms, sendOtpSms } from "../services/otpService.js";
import LoginTrackingService from "../services/loginTrackingService.js";

class AuthController {
    // Generate 6-digit OTP
    // static generateOTP() {
    //     return Math.floor(100000 + Math.random() * 900000).toString();
    // }

    // static async sendOTP(req, res) {
    //     try {
    //         console.log("🔑 Sending OTP...");
    //         const { phone } = req.body;

    //         // ✅ Validate phone number
    //         if (!phone || !/^[1-9]\d{9}$/.test(phone)) {
    //             throw new Error("Invalid phone number. Must be 10 digits and not start with 0.");
    //         }

    //         // ✅ Check if user exists
    //         let [user] = await db.select().from(UsersModel).where(eq(UsersModel.mobile_number, phone)).limit(1);

    //         // ✅ Create user if not exists
    //         if (!user) {
    //             const [newUser] = await db.insert(UsersModel)
    //                 .values({
    //                 mobile_number: phone,
    //                 status: "Active",
    //                 created_at: new Date(),
    //                 updated_at: new Date(),
    //                 })
    //                 .returning();
    //             user = newUser;
    //         }

    //         // ✅ Throttle OTP requests
    //         const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    //         const recentOtps = await db.select()
    //         .from(OtpsModel)
    //         .where(and(
    //             eq(OtpsModel.phone, phone),
    //             gte(OtpsModel.issued_at, fiveMinutesAgo)
    //         ));

    //         if (recentOtps.length >= 3) {
    //             throw new Error("You can only request OTP three times within 5 minutes. Wait a while before trying again.");
    //         }

    //         // ✅ Generate and insert OTP
    //         const otp = AuthController.generateOTP();
    //         const [insertedOtp] = await db.insert(OtpsModel)
    //         .values({
    //             phone,
    //             code: otp,
    //             status: true,
    //             issued_at: new Date(),
    //         })
    //         .returning();

    //         // ✅ Link OTP to user
    //         await db.update(UsersModel)
    //         .set({ otp_id: insertedOtp.id })
    //         .where(eq(UsersModel.id, user.id));

    //         // For now, print the OTP in response
    //         return res.json({ message: "OTP sent successfully", otp: insertedOtp.code });
    //     } catch (error) {
    //         console.error("❌ Failed to send OTP:", error);
    //         return res.status(500).json({ message: error.message || "Internal Server Error" });
    //     }
    // }

    // static async verifyOTP(req, res) {
    //     try {
    //         const { phone, otp } = req.body;

    //         // ✅ Validate input
    //         if (!phone || !/^[1-9]\d{9}$/.test(phone)) {
    //             throw new Error("Invalid phone number.");
    //         }

    //         if (!otp || !/^\d{6}$/.test(otp)) {
    //             throw new Error("Invalid OTP format.");
    //         }

    //         // ✅ Check OTP validity
    //         const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    //         const [validOtp] = await db.select()
    //         .from(OtpsModel)
    //         .where(and(
    //             eq(OtpsModel.phone, phone),
    //             eq(OtpsModel.code, otp),
    //             eq(OtpsModel.status, true),
    //             gte(OtpsModel.issued_at, fiveMinutesAgo)
    //         ))
    //         .limit(1);

    //         if (!validOtp) {
    //             throw new Error("OTP is invalid or expired.");
    //         }

    //         // ✅ Mark OTP as used
    //         await db.update(OtpsModel)
    //         .set({ status: false })
    //         .where(eq(OtpsModel.id, validOtp.id));


    //         // get user id
    //         const userWithCustomer = await db.query.users.findFirst({
    //             where: (users, { eq, and }) => and(
    //                 eq(users.mobile_number, phone),
    //                 eq(users.status, "Active")
    //             ),
    //             with: {
    //                 customer: true,
    //             },
    //         });

    //         if (!userWithCustomer) {
    //             throw new Error("User login details not found.");
    //         }

    //         // ✅ If customer does not exist, create one
    //         let customerId = userWithCustomer.customer?.id;
    //         if (!customerId) {
    //             const [newCustomer] = await db.insert(CustomersModel).values({
    //                 user_id: userWithCustomer.id,
    //                 customer_name: '',
    //                 gender: '',
    //                 mobile_number: phone,
    //                 profile_photo: [],
    //                 createdat: new Date(),
    //                 updatedat: new Date(),
    //             }).returning();

    //             customerId = newCustomer.id;

    //             // ✅ Update the users table to link this customer
    //             await db.update(UsersModel)
    //                 .set({ user_id: customerId })
    //                 .where(eq(UsersModel.id, userWithCustomer.id));
    //         }

    //         // inside your verifyOTP method
    //         const token = jwt.sign(
    //             { userId: userWithCustomer.id, customerId: customerId }, // payload
    //             process.env.JWT_SECRET || 'my-pvt-key-2025',            // secret key
    //             { expiresIn: "30d" }                // token valid for 30 days
    //         );

    //         // for profile update page which is redirected after verify otp
    //         const user_info = {
    //             profile_image: userWithCustomer.profile_image,
    //             full_name: userWithCustomer.customer?.customer_name || '',
    //             gender: userWithCustomer.customer?.gender || '',
    //             dob: userWithCustomer.customer?.dob || '',
    //             phone_number: userWithCustomer.mobile_number,
    //         };

    //         return res.json({ message: "OTP verified successfully", token: token, user_info: user_info });
    //     } catch (error) {
    //         console.error("❌ OTP Verification failed:", error);
    //         return res.status(500).json({ message: error.message || "Internal Server Error" });
    //     }
    // }


    // static async firebasePhoneLogin(req, res) {
    //     try {
    //         const { phone } = req.body;

    //         if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone)) {
    //             throw new Error("Invalid phone number.");
    //         }

    //         // Same user lookup and customer creation logic
    //         let userWithCustomer = await db.query.users.findFirst({
    //             where: (users, { eq, and }) => and(
    //                 eq(users.mobile_number, phone),
    //             ),
    //             with: {
    //                 customer: true,
    //             },
    //         });

    //         if (!userWithCustomer) {
    //             const [newUser] = await db.insert(UsersModel)
    //                 .values({
    //                 mobile_number: phone,
    //                 status: "Active",
    //                 created_at: new Date(),
    //                 updated_at: new Date(),
    //                 })
    //                 .returning();
    //             userWithCustomer = newUser;
    //         }

    //         let customerId = userWithCustomer.customer?.id;
    //         if (!customerId) {
    //             const [newCustomer] = await db.insert(CustomersModel).values({
    //                 user_id: userWithCustomer.id,
    //                 customer_name: '',
    //                 gender: '',
    //                 mobile_number: phone,
    //                 profile_photo: [],
    //                 createdat: new Date(),
    //                 updatedat: new Date(),
    //             }).returning();

    //             customerId = newCustomer.id;

    //             await db.update(UsersModel)
    //                 .set({ user_id: customerId })
    //                 .where(eq(UsersModel.id, userWithCustomer.id));
    //         }

    //         const token = jwt.sign(
    //             { userId: userWithCustomer.id, customerId: customerId },
    //             process.env.JWT_SECRET || 'my-pvt-key-2025',
    //             { expiresIn: "30d" }
    //         );

    //         const user_info = {
    //             profile_image: userWithCustomer.profile_image,
    //             full_name: userWithCustomer.customer?.customer_name || '',
    //             gender: userWithCustomer.customer?.gender || '',
    //             dob: userWithCustomer.customer?.dob || '',
    //             phone_number: userWithCustomer.mobile_number,
    //         };

    //         return res.json({ message: "Login successful", token, user_info });
    //     } catch (error) {
    //         console.error("❌ Phone login failed:", error);
    //         return res.status(500).json({ message: error.message || "Internal Server Error" });
    //     }
    // }

    // for email
    // static async canSendOtp(userId, user_type, purpose, channel) {
    //     const now = new Date();
    //     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    //     const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    //     // Count active OTPs sent in last 1 hour (not consumed, not invalidated, not expired)
    //     const recentOtps = await db.select()
    //         .from(OtpChallengesModel)
    //         .where(and(
    //             eq(OtpChallengesModel.user_id, userId),
    //             eq(OtpChallengesModel.user_type, user_type),
    //             eq(OtpChallengesModel.purpose, purpose),
    //             eq(OtpChallengesModel.channel, channel),
    //             gte(OtpChallengesModel.sent_at, oneHourAgo),
    //             isNull(OtpChallengesModel.consumed_at),
    //             isNull(OtpChallengesModel.invalidated_at),
    //         ));

    //     if (recentOtps.length >= 3) {
    //         // Get the latest OTP
    //         const [latestOtp] = await db.select()
    //             .from(OtpChallengesModel)
    //             .where(and(
    //                 eq(OtpChallengesModel.user_id, userId),
    //                 eq(OtpChallengesModel.user_type, user_type),
    //                 eq(OtpChallengesModel.purpose, purpose),
    //                 eq(OtpChallengesModel.channel, channel),
    //             ))
    //             .orderBy(desc(OtpChallengesModel.sent_at))
    //             .limit(1);

    //         if (latestOtp && latestOtp.sent_at > twoHoursAgo) {
    //             throw new Error("Too many OTP requests. Try again after 2 hours.");
    //         }
    //     }
    // }



    static async canSendOtp(userId, user_type, purpose, channel) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      // Count active OTPs sent in last 1 hour (not consumed, not invalidated, not expired)
      const recentOtps = await db.select()
          .from(OtpChallengesModel)
          .where(and(
              eq(OtpChallengesModel.user_id, userId),
              eq(OtpChallengesModel.user_type, user_type),
              eq(OtpChallengesModel.purpose, purpose),
              eq(OtpChallengesModel.channel, channel),
              gte(OtpChallengesModel.sent_at, oneHourAgo),
              isNull(OtpChallengesModel.consumed_at),
              isNull(OtpChallengesModel.invalidated_at),
          ));

      // --- START OF COMMENTED-OUT LIMITER ---
      /*
      if (recentOtps.length >= 3) {
          // Get the latest OTP
          const [latestOtp] = await db.select()
              .from(OtpChallengesModel)
              .where(and(
                  eq(OtpChallengesModel.user_id, userId),
                  eq(OtpChallengesModel.user_type, user_type),
              eq(OtpChallengesModel.purpose, purpose),
                  eq(OtpChallengesModel.channel, channel),
              ))
              .orderBy(desc(OtpChallengesModel.sent_at))
              .limit(1);

          if (latestOtp && latestOtp.sent_at > twoHoursAgo) {
              throw new Error("Too many OTP requests. Try again after 2 hours.");
          }
      }
      */
      // --- END OF COMMENTED-OUT LIMITER ---
  }

  static async login_admin(req, res) {
    try {
      const { user_id, password } = req.body;

      // Demo Mode Admin Bypass:
      if (process.env.PORTFOLIO_DEMO_MODE === "true" && user_id === "admin" && password === "admin") {
        console.log("[DEMO MODE] Admin bypass login successful.");
        const tokenVersion = incrementAdminTokenVersion();
        const secretKey = process.env.JWT_SECRET || "my-pvt-key-2025";
        const token = jwt.sign(
          {
            id: "admin",
            role: "admin",
            token_version: tokenVersion,
          },
          secretKey,
          { expiresIn: "1d" }
        );
        return res.status(200).json({
          message: "Admin login successful",
          token,
        });
      }

      // Load admin credentials from environment
      const envAdminId = process.env.ADMIN_ID;
      const envAdminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      if (!envAdminId || !envAdminPasswordHash) {
        return res.status(500).json({ message: "Admin credentials not setup" });
      }

      // Check ID
      if (user_id !== envAdminId) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Check password against hashed password
      const isPasswordValid = await bcrypt.compare(password, envAdminPasswordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Increment token_version to invalidate previous tokens
      const tokenVersion = incrementAdminTokenVersion();

      // Generate JWT
      const secretKey = process.env.JWT_SECRET || "my-pvt-key-2025";
      const token = jwt.sign(
        {
          id: envAdminId,
          role: "admin",
          token_version: tokenVersion,
        },
        secretKey,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Admin login successful",
        token,
      });
    } catch (error) {
      console.error("❌ Admin login error:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }


  static async sendEmailOtp(req, res) {
    try {
      const { email, purpose = "login", user_type = "customer" } = req.body;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Valid email address is required.");
      }

      let user;

      if (user_type === "groomer") {
        // Groomer login
        [user] = await db.select().from(GroomersModel).where(eq(GroomersModel.email_id, email)).limit(1);

        if (!user) {
          if (process.env.PORTFOLIO_DEMO_MODE === "true") {
            const [newGroomer] = await db.insert(GroomersModel).values({
              groomer_name: "Demo Groomer",
              gender: "Male",
              email_id: email,
              mobile_number: "9876543210",
              level: "Senior",
              profile_image: [],
              status: "Approved",
            }).returning();
            user = newGroomer;
          } else {
            throw new Error("Groomer email not found");
          }
        }

        // 👇 *** ADD THIS CHECK ***
        if (user.delete === true) {
          throw new Error("This account has been disabled.");
        }

      } else {
        // Default customer login
        [user] = await db.select().from(UsersModel).where(eq(UsersModel.email_id, email)).limit(1);

        if (!user) {
          const [newUser] = await db.insert(UsersModel).values({
            email_id: email,
            status: "Active",
            created_at: new Date(),
            updated_at: new Date(),
          }).returning();
          user = newUser;
        }
      }

      // Check if Demo Mode is enabled
      if (process.env.PORTFOLIO_DEMO_MODE === "true") {
        console.log(`[DEMO MODE] OTP Send requested for Email: ${email}. Bypassing Mailgun. Use OTP: 123456`);
        
        const pepper = process.env.OTP_PEPPER || "static-pepper";
        const codeHash = crypto.createHmac("sha256", pepper).update("123456").digest("hex");
        
        await db.update(OtpChallengesModel)
          .set({ invalidated_at: new Date() })
          .where(and(
            eq(OtpChallengesModel.user_id, user.id),
            eq(OtpChallengesModel.user_type, user_type),
            eq(OtpChallengesModel.purpose, purpose),
            eq(OtpChallengesModel.channel, "email"),
            isNull(OtpChallengesModel.consumed_at),
            isNull(OtpChallengesModel.invalidated_at),
          ));

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
        await db.insert(OtpChallengesModel).values({
          user_id: user.id,
          user_type,
          purpose,
          channel: "email",
          code_hash: codeHash,
          code_len: 6,
          expires_at: expiresAt,
          sent_at: new Date(),
          metadata: { demo: true },
        });

        return res.json({ message: "OTP sent to email successfully. (Demo Mode: Use 123456)" });
      }

      // enforce throttling
      await AuthController.canSendOtp(user.id, user_type, purpose, "email");

      // issue OTP
      const { code } = await AuthController.issueOtp(user.id, purpose, "email", 6, user_type);

      await sendMail(
        email,
        "Your OTP Code",
        `Your OTP code is: ${code}. It will expire in 5 minutes.`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center;">🔐 Email Verification</h2>
              <p style="font-size: 16px; color: #555;">
                Use the following One-Time Password (OTP) to complete your login/verification process:
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #2c3e50; letter-spacing: 4px; padding: 10px 20px; border: 2px solid #2c3e50; border-radius: 8px;">
                  ${code}
                </span>
              </div>
              <p style="font-size: 14px; color: #888;">
                ⚠️ This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.
              </p>
              <p style="font-size: 14px; color: #aaa; text-align: center; margin-top: 20px;">
                &copy; ${new Date().getFullYear()} BhaoBhao. All rights reserved.
              </p>
            </div>
          </div>
        `
      );

      return res.json({ message: "OTP sent to email successfully." });
    } catch (err) {
      console.error("❌ sendEmailOtp error:", err);
      return res.status(400).json({ message: err.message });
    }
  }

  static async verifyEmailOtp(req, res) {
    try {
      const { email, otp, purpose = "login", user_type = "customer" } = req.body;

      if (!email || !otp) throw new Error("Email and OTP are required.");

      let userWithCustomerOrGroomer;
      let isNewUser = false;

      if (user_type === "groomer") {
        [userWithCustomerOrGroomer] = await db.select().from(GroomersModel).where(eq(GroomersModel.email_id, email)).limit(1);

        if (!userWithCustomerOrGroomer) {
            throw new Error("Groomer email not found");
        }

        // 👇 *** ADD THIS CHECK ***
        if (userWithCustomerOrGroomer.deleted === true) {
            throw new Error("This account has been disabled.");
        }
      } else {
        userWithCustomerOrGroomer = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email_id, email),
          with: {
            customer: true,
          },
        });
        if (!userWithCustomerOrGroomer) {
            throw new Error("Customer email not found");
          // const [newUser] = await db.insert(UsersModel).values({
          //   email_id: email,
          //   status: "Active",
          //   created_at: new Date(),
          //   updated_at: new Date(),
          // }).returning();
          // userWithCustomerOrGroomer = newUser;
        }
      }

      // hash OTP
      const pepper = process.env.OTP_PEPPER || "static-pepper";
      const codeHash = crypto.createHmac("sha256", pepper).update(otp).digest("hex");

      // validate otp
      const [validOtp] = await db.select().from(OtpChallengesModel).where(and(
        eq(OtpChallengesModel.user_id, userWithCustomerOrGroomer.id),
        eq(OtpChallengesModel.user_type, user_type),
        eq(OtpChallengesModel.purpose, purpose),
        eq(OtpChallengesModel.channel, "email"),
        eq(OtpChallengesModel.code_hash, codeHash),
        gte(OtpChallengesModel.expires_at, new Date()),
        isNull(OtpChallengesModel.consumed_at),
        isNull(OtpChallengesModel.invalidated_at),
      ))
      .orderBy(desc(OtpChallengesModel.sent_at))
      .limit(1);

      if (!validOtp) throw new Error("Invalid or expired OTP.");

      // mark OTP consumed
      await db.update(OtpChallengesModel).set({ consumed_at: new Date() }).where(eq(OtpChallengesModel.id, validOtp.id));

      let customerId;
      if(user_type === "customer") {
        // ensure customer exists
        customerId = userWithCustomerOrGroomer.customer?.id;
        if (!customerId) {
          const [newCustomer] = await db.insert(CustomersModel).values({
              user_id: userWithCustomerOrGroomer.id,
              customer_name: '',
              gender: '',
              mobile_number: userWithCustomerOrGroomer.mobile_number || '',
              profile_photo: [],
              createdat: new Date(),
              updatedat: new Date(),
          }).returning();


          customerId = newCustomer.id;

          await db.update(UsersModel)
              .set({ user_id: customerId })
              .where(eq(UsersModel.id, userWithCustomerOrGroomer.id));

          isNewUser = true;
        }
      }

      let updatedUser;
      if(user_type === "customer") {
        [updatedUser] = await db.update(UsersModel)
        .set({ token_version: (userWithCustomerOrGroomer.token_version || 0) + 1 })
        .where(eq(UsersModel.id, userWithCustomerOrGroomer.id))
        .returning();
      }
      else if(user_type === "groomer") {
        [updatedUser] = await db.update(GroomersModel)
        .set({ token_version: (userWithCustomerOrGroomer.token_version || 0) + 1 })
        .where(eq(GroomersModel.id, userWithCustomerOrGroomer.id))
        .returning();
      }

      // generate JWT
      const tokenPayload = {
        userId: userWithCustomerOrGroomer.id,
        role: user_type,
        token_version: updatedUser.token_version,
      };

      // add customer_id if role is customer
      if (user_type === "customer" && customerId) {
        tokenPayload.customerId = customerId;
      }

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || "my-pvt-key-2025",
        { expiresIn: "30d" }
      );

      const user_info = {
        email: userWithCustomerOrGroomer.email_id,
        role: user_type,
      };

      if (user_type === "customer") {
        user_info.profile_image = userWithCustomerOrGroomer.profile_image
          ? process.env.SERVER_BASE_URL + '/uploads/' + userWithCustomerOrGroomer.profile_image
          : null;
        user_info.full_name = userWithCustomerOrGroomer.customer?.customer_name || "";
        user_info.gender = userWithCustomerOrGroomer.customer?.gender || "";
        user_info.dob = userWithCustomerOrGroomer.customer?.dob || "";
        user_info.phone_number = userWithCustomerOrGroomer.mobile_number;
      }
      else if (user_type === "groomer") {
        user_info.groomer_name = userWithCustomerOrGroomer.groomer_name;
        user_info.gender = userWithCustomerOrGroomer.gender;
        user_info.mobile_number = userWithCustomerOrGroomer.mobile_number;
        user_info.profile_image = userWithCustomerOrGroomer.profile_image;
        user_info.dob = userWithCustomerOrGroomer.dob;
      }

      return res.json({ message: "OTP verified successfully", token, user_info, new_user: isNewUser });
    } catch (err) {
      console.error("❌ verifyEmailOtp error:", err);
      return res.status(400).json({ message: err.message });
    }
  }

  static async issueOtp(userId, purpose, channel, codeLen = 6, user_type = "customer") {
    try {
      const code = Math.floor(Math.random() * Math.pow(10, codeLen)).toString().padStart(codeLen, "0");

      const pepper = process.env.OTP_PEPPER || "static-pepper";
      const codeHash = crypto.createHmac("sha256", pepper).update(code).digest("hex");

      await db.update(OtpChallengesModel)
      .set({ invalidated_at: new Date() })
      .where(and(
        eq(OtpChallengesModel.user_id, userId),
        eq(OtpChallengesModel.user_type, user_type),
        eq(OtpChallengesModel.purpose, purpose),
        eq(OtpChallengesModel.channel, "email"),
        isNull(OtpChallengesModel.consumed_at),
        isNull(OtpChallengesModel.invalidated_at),
      ));

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

      const [otp] = await db.insert(OtpChallengesModel).values({
        user_id: userId,
        user_type,
        purpose,
        channel,
        code_hash: codeHash,
        code_len: codeLen,
        expires_at: expiresAt,
        sent_at: new Date(),
        metadata: {},
      }).returning();

      return { otp, code };
    } catch (err) {
      console.error("Error issuing OTP:", err);
      throw new Error("Failed to issue OTP");
    }
  }


  static async sendSmsOtp(req, res) {
    try {
      const { phone, purpose = "login", user_type = "customer" } = req.body;

      if (!phone || !/^[1-9]\d{9}$/.test(phone)) {
        throw new Error("Valid phone number is required.");
      }

      const msisdn = "91" + phone;

      let user;

      if (user_type === "groomer") {
        // Groomer login via phone
        [user] = await db.select().from(GroomersModel).where(eq(GroomersModel.mobile_number, phone)).limit(1);

        if (!user) {
          if (process.env.PORTFOLIO_DEMO_MODE === "true") {
            const [newGroomer] = await db.insert(GroomersModel).values({
              groomer_name: "Demo Groomer",
              gender: "Male",
              email_id: `groomer_${phone}@bhaobhao.in`,
              mobile_number: phone,
              level: "Senior",
              profile_image: [],
              status: "Approved",
            }).returning();
            user = newGroomer;
          } else {
            throw new Error("Groomer phone not found");
          }
        }

        // 👇 *** THE FIX FOR GROOMERS ***
        if (user.delete === true) {
            throw new Error("This account has been disabled.");
        }
        // *** END ADDITION ***

      }else {
        // Customer login
        [user] = await db.select().from(UsersModel).where(eq(UsersModel.mobile_number, phone)).limit(1);

        if (!user) {
          // Create new user for new phone numbers
          const [newUser] = await db.insert(UsersModel).values({
            mobile_number: phone,
            user_name: `User_${phone}`,
            status: "Active",
            token_version: 0,
            created_at: new Date(),
            updated_at: new Date(),
          }).returning();
          user = newUser;
        } else {
          // 👇 *** THE FIX FOR CUSTOMERS ***
          if (user.status !== "Active") {
              throw new Error("This account has been disabled.");
          }
          // *** END ADDITION ***
        }
      }

      // Check if Demo Mode is enabled
      if (process.env.PORTFOLIO_DEMO_MODE === "true") {
        console.log(`[DEMO MODE] OTP Send requested for Phone: ${phone}. Bypassing RML SMS provider. Use OTP: 123456`);
        
        await db.update(OtpChallengesModel)
          .set({ invalidated_at: new Date() })
          .where(and(
            eq(OtpChallengesModel.user_id, user.id),
            eq(OtpChallengesModel.user_type, user_type),
            eq(OtpChallengesModel.purpose, purpose),
            eq(OtpChallengesModel.channel, "sms"),
            isNull(OtpChallengesModel.consumed_at),
            isNull(OtpChallengesModel.invalidated_at),
          ));

        await db.insert(OtpChallengesModel).values({
          user_id: user.id,
          user_type,
          purpose,
          channel: "sms",
          sent_at: new Date(),
          metadata: { demo: true, code: "123456" },
        });

        return res.json({ message: "OTP sent successfully (Demo Mode: Use 123456)" });
      }

      // enforce throttling
      await AuthController.canSendOtp(user.id, user_type, purpose, "sms");

      // send OTP via provider
      const smsResponse = await sendOtpSms(msisdn);

      // store in DB for tracking

      await db.insert(OtpChallengesModel).values({
        user_id: user.id,
        user_type,
        purpose,
        channel: "sms",
        sent_at: new Date(),
        metadata: smsResponse,
      });

      return res.json({ message: "OTP sent successfully" });
    } catch (err) {
      console.error("❌ sendSmsOtp error:", err);
      return res.status(400).json({ message: err.message });
    }
  }

  static async verifySmsOtp(req, res) {
    try {
      const { phone, otp, purpose = "login", user_type = "customer" } = req.body;

      if (!phone || !otp) throw new Error("Phone number and OTP are required.");

      const msisdn = "91" + phone;

      let userWithCustomerOrGroomer;
      let isNewUser = false;

      if (user_type === "groomer") {
        [userWithCustomerOrGroomer] = await db.select()
          .from(GroomersModel)
          .where(eq(GroomersModel.mobile_number, phone))
          .limit(1);

        if (!userWithCustomerOrGroomer) {
          throw new Error("Groomer phone number not found.");
        }
      } else {
        userWithCustomerOrGroomer = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.mobile_number, phone),
          with: { customer: true }
        });

        if (!userWithCustomerOrGroomer) {
          throw new Error("Customer phone number not found.");
        }
      }

      let code = "101";
      let message = "OTP validated successfully";

      if (process.env.PORTFOLIO_DEMO_MODE === "true" && otp === "123456") {
        console.log(`[DEMO MODE] OTP Verification bypassed for Phone: ${phone}`);
      } else {
        // Call standard SMS OTP verification utility
        const verifyResult = await verifyOtpSms(phone, otp);
        code = verifyResult.code;
        message = verifyResult.message;
      }

      if (code !== "101") {
        throw new Error(message);
      }

      // Mark latest OTP challenge as consumed
      const [latestOtp] = await db.select()
        .from(OtpChallengesModel)
        .where(and(
          eq(OtpChallengesModel.user_id, userWithCustomerOrGroomer.id),
          eq(OtpChallengesModel.user_type, user_type),
          eq(OtpChallengesModel.purpose, purpose),
          eq(OtpChallengesModel.channel, "sms"),
          isNull(OtpChallengesModel.consumed_at),
          isNull(OtpChallengesModel.invalidated_at),
        ))
        .orderBy(desc(OtpChallengesModel.sent_at))
        .limit(1);

      if (latestOtp) {
        await db.update(OtpChallengesModel)
          .set({ consumed_at: new Date() })
          .where(eq(OtpChallengesModel.id, latestOtp.id));
      }

      // NEW: Track user login for analytics
      if (user_type === "customer") {
        try {
          await LoginTrackingService.trackUserLogin(
            userWithCustomerOrGroomer.id,
            req.ip,
            req.get('User-Agent')
          );
          console.log(`✅ Login tracked for customer ${userWithCustomerOrGroomer.id}`);
        } catch (trackingError) {
          console.error(`⚠️ Login tracking failed for customer ${userWithCustomerOrGroomer.id}:`, trackingError);
          // Continue with login even if tracking fails
        }
      }

      let customerId;
      if (user_type === "customer") {
        customerId = userWithCustomerOrGroomer.customer?.id;
        if (!customerId) {
          const [newCustomer] = await db.insert(CustomersModel).values({
            user_id: userWithCustomerOrGroomer.id,
            customer_name: "",
            gender: "",
            mobile_number: userWithCustomerOrGroomer.mobile_number || "",
            profile_photo: [],
            createdat: new Date(),
            updatedat: new Date(),
          }).returning();

          customerId = newCustomer.id;

          await db.update(UsersModel)
            .set({ user_id: customerId })
            .where(eq(UsersModel.id, userWithCustomerOrGroomer.id));

          // Refresh user query to include the newly created customer
          userWithCustomerOrGroomer = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.mobile_number, phone),
            with: { customer: true }
          });

          isNewUser = true;
        }
      }

      let updatedUser;
      if (user_type === "customer") {
        [updatedUser] = await db.update(UsersModel)
          .set({ token_version: (userWithCustomerOrGroomer.token_version || 0) + 1 })
          .where(eq(UsersModel.id, userWithCustomerOrGroomer.id))
          .returning();
      } else if (user_type === "groomer") {
        [updatedUser] = await db.update(GroomersModel)
          .set({ token_version: (userWithCustomerOrGroomer.token_version || 0) + 1 })
          .where(eq(GroomersModel.id, userWithCustomerOrGroomer.id))
          .returning();
      }

      const tokenPayload = {
        userId: userWithCustomerOrGroomer.id,
        role: user_type,
        token_version: updatedUser.token_version,
      };

      if (user_type === "customer" && customerId) {
        tokenPayload.customerId = customerId;
      }

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || "my-pvt-key-2025",
        { expiresIn: "30d" }
      );

      const user_info = {
        phone_number: userWithCustomerOrGroomer.mobile_number,
        role: user_type,
      };

      if (user_type === "customer") {
        user_info.profile_image = userWithCustomerOrGroomer.profile_image
          ? process.env.SERVER_BASE_URL + "/uploads/" + userWithCustomerOrGroomer.profile_image
          : null;
        user_info.full_name = userWithCustomerOrGroomer.customer?.customer_name || "";
        user_info.gender = userWithCustomerOrGroomer.customer?.gender || "";
        user_info.dob = userWithCustomerOrGroomer.customer?.dob || "";
      } else if (user_type === "groomer") {
        user_info.groomer_name = userWithCustomerOrGroomer.groomer_name;
        user_info.gender = userWithCustomerOrGroomer.gender;
        user_info.profile_image = userWithCustomerOrGroomer.profile_image;
        user_info.dob = userWithCustomerOrGroomer.dob;
      }

      return res.json({
        message: "OTP verified successfully",
        token,
        user_info,
        new_user: isNewUser
      });
    } catch (err) {
      console.error("❌ verifySmsOtp error:", err);
      return res.status(400).json({ message: err.message });
    }
  }


}

export default AuthController;
