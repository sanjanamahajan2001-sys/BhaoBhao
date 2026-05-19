import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users as UsersModel } from "../db/schema/users.js";
import { customers as CustomersModel } from "../db/schema/customers.js";
import toBoolean from "../utils/toBoolean.js";

class ProfileController {
  static async save(req, res) {
    try {
      const user_id = req.user.userId;
      if (!user_id) throw new Error("User ID not found in user session.");
      
      const { customer_name, gender, dob, email_id, remove_profile_image = false } = req.body;

      // First, get the customer ID via users table using user_id
      const user = await db.query.users.findFirst({
        where: eq(UsersModel.id, user_id),
        with: {
          customer: true,
        },
      });

      if (!user || !user.customer) {
        throw new Error("User details not found for this user.");
      }

      if (toBoolean(remove_profile_image)) {
        // Update the user's profile image to null
        await db.update(UsersModel)
          .set({
            profile_image: null
          })
          .where(eq(UsersModel.id, user.id));
      }

      // update dp path if uploaded
      const uploadedFile = req.file;
      let filePath = null;
      if (uploadedFile && !toBoolean(remove_profile_image)) {
        const { filename } = uploadedFile;

        // You can get relative path like this
        filePath = `${req.uploadPath}/${filename}`;
        
        // Update the user's profile image path
        await db.update(UsersModel)
          .set({
            profile_image: filePath
          })
          .where(eq(UsersModel.id, user.id));
      }

      // Update the customer
      await db.update(CustomersModel)
        .set({
          customer_name,
          gender,
          dob: dob ? new Date(dob) : null,
        })
        .where(eq(CustomersModel.id, user.user_id));

      // update the user
      await db.update(UsersModel)
        .set({
          email_id: email_id
        })
        .where(eq(UsersModel.id, user.id));

      // Fetch updated user profile
      const updatedUser = await db.query.users.findFirst({
        where: eq(UsersModel.id, user.id),
        with: {
          customer: true,
        },
      });

      return res.json({ 
        message: "Profile updated successfully", 
        email: updatedUser.email_id,
        profile_image: updatedUser.profile_image
            ? process.env.SERVER_BASE_URL + '/uploads/' + updatedUser.profile_image
            : null,
        full_name: updatedUser.customer?.customer_name,
        gender: updatedUser.customer?.gender,
        dob: updatedUser.customer?.dob,
        phone_number: updatedUser.mobile_number,
      });
    } catch (error) {
      console.error("❌ Failed to update customer:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

  static async view(req, res) {
    try {
      const user_id = req.user.userId;
      if (!user_id) throw new Error("User ID not found in user session.");

      const user = await db.query.users.findFirst({
        where: eq(UsersModel.id, user_id),
        with: {
          customer: true,
        },
      });

      if (!user || !user.customer) {
        return res.status(404).json({ message: "User profile not found." });
      }

      const profileData = {
        customer_name: user.customer?.customer_name,
        gender: user.customer?.gender,
        dob: user.customer.dob ? user.customer.dob.toISOString().split("T")[0] : null,
        profile_image: user.profile_image
          ? process.env.SERVER_BASE_URL + '/uploads/' + user.profile_image
          : null,
        mobile_number: user.mobile_number,
        email_id: user.email_id
      };

      return res.json(profileData);
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error);
      return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }

}

export default ProfileController;
