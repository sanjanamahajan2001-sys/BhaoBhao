// routes/auth.js
import express from "express";
import AuthController from "../controllers/auth.js";

const router = express.Router();

// router.post("/sendOTP", AuthController.sendOTP);
// router.post("/verifyOTP", AuthController.verifyOTP);
// router.post("/firebasePhoneLogin", AuthController.firebasePhoneLogin);

router.post("/mailgun_sendOTP", AuthController.sendEmailOtp);
router.post("/mailgun_verifyOTP", AuthController.verifyEmailOtp);

router.post("/login_admin", AuthController.login_admin);

// SMS OTP routes
router.post("/sms_sendOTP", AuthController.sendSmsOtp);
router.post("/sms_verifyOTP", AuthController.verifySmsOtp);


export default router;
