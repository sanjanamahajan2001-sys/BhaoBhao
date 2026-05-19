import axios from "axios";

const smsMessages = {
  "1701": "Success",
  "1702": "Invalid URL Error (missing parameter)",
  "1703": "Invalid username or password",
  "1704": "Invalid 'type' field",
  "1705": "Invalid Message",
  "1706": "Invalid Destination",
  "1707": "Invalid Source",
  "1709": "Bind Failed",
  "1710": "Internal Error",
  "1713": "Too Many Destinations",
  "1025": "Insufficient Credit",
  "1028": "Spam Message",
  "1032": "DND destination"
};

export async function sendOtpSms(phone) {
  try {
    const { RML_USERNAME, RML_PASSWORD, RML_SOURCE, RML_OTPLEN, RML_EXPIRE_TIME, RML_ENTITY_ID, RML_TEMP_ID } = process.env;
    const url = "https://sms6.rmlconnect.net:8443/OtpApi/otpgenerate";

    const params = {
      username: RML_USERNAME,
      password: RML_PASSWORD,
      msisdn: phone,
      msg: "Your login OTP is %m for Bhao Bhao. Please do not share it with anyone. - Bhao Bhao",
      // msg: "Your OTP for registration is %m. Please do not share it with anyone. - Bhao Bhao",
      source: RML_SOURCE,
      otplen: RML_OTPLEN,
      exptime: RML_EXPIRE_TIME,
      entityid: RML_ENTITY_ID,
      tempid: RML_TEMP_ID
    };

    const response = await axios.get(url, { params });
    return response.data;
  } catch (err) {
    console.error("❌ sendSmsOtp error:", err.message || err);
    throw new Error("Failed to send OTP SMS");
  }
}

export async function verifyOtpSms(phone, otp) {
  try {
    const { RML_USERNAME, RML_PASSWORD } = process.env;
    const url = "https://sms6.rmlconnect.net:8443/OtpApi/checkotp";
    const params = {
      username: RML_USERNAME,
      password: RML_PASSWORD,
      msisdn: phone,
      otp: otp
    };

    const response = await axios.get(url, { params, responseType: "text" });

    const resultCode = response.data.trim();

    const messages = {
      "101": "OTP validated successfully",
      "102": "OTP has expired",
      "103": "Entry for OTP not found",
      "104": "MSISDN not found",
      "1702": "One of the parameters missing or OTP is not numeric",
      "1703": "Authentication failed",
      "1706": "Given destination is invalid"
    };

    return {
      code: resultCode,
      message: messages[resultCode] || "Unknown error from OTP provider"
    };

  } catch (err) {
    console.error("❌ verifySmsOtp error:", err.message || err);
    throw new Error("Failed to verify OTP SMS");
  }
}

export async function getSmsToken() {
  try {
    const { RML_USERNAME, RML_PASSWORD } = process.env;
    const url = "https://sms6.rmlconnect.net:8443/bulksms/generatetoken?username=bhaobhaoOTP&password=Yw(o9)6O";
    const params = {
      username: RML_USERNAME,
      password: RML_PASSWORD,
    };

    const response = await axios.get(url, { params, responseType: "text" });
    const data = response.data.trim();

    // Error codes for token API
    const tokenErrors = {
      "1702": "Invalid URL / missing parameter",
      "1703": "Invalid username or password",
      "1704": "Invalid type field",
      "1705": "Invalid message",
      "1706": "Invalid destination",
      "1707": "Invalid source",
      "1709": "Bind failed",
      "1710": "Internal error",
      "1713": "Too many destinations",
      "1025": "Insufficient credit",
      "1028": "Spam message",
      "1032": "DND destination",
    };

    if (tokenErrors[data]) {
      return { success: false, code: data, message: tokenErrors[data] };
    }

    // Any other string is the token
    return { success: true, token: data };

  } catch (err) {
    console.error("❌ getSmsToken error:", err.message || err);
    throw new Error("Failed to get SMS token");
  }
}

export async function sendReminderSms(token, phone, message) {
  try {
    const { RML_SOURCE, RML_ENTITY_ID, RML_TEMP_ID_REMINDER } = process.env;
    const url = `https://sms6.rmlconnect.net:8443/bulksms/bulksubmit`;
    const params = {
      token,
      message,
      type: 0,
      destination: phone,
      source: RML_SOURCE,
      entityid: RML_ENTITY_ID,
      tempid: RML_TEMP_ID_REMINDER
    };

    const response = await axios.get(url, { params, responseType: "text" });
    const result = response.data.trim();

    // Example: 1701|919876543210:123456789
    const code = result.split("|")[0];
    return {
      raw: result,
      code,
      message: smsMessages[code] || "Unknown response"
    };
  } catch (err) {
    console.error("❌ sendReminderSms error:", err.message || err);
    throw new Error("Failed to send reminder SMS");
  }
}

export async function sendAdminBookingSms(token, phones, message) {
  try {
    const { RML_SOURCE, RML_ENTITY_ID, RML_TEMP_ID_ADMIN_BOOKING } = process.env;
    const url = `https://sms6.rmlconnect.net:8443/bulksms/bulksubmit`;

    // Split by comma and clean up numbers
    const phoneList = String(phones).split(',').map(p => p.trim()).filter(Boolean);
    const results = [];

    for (const phone of phoneList) {
      const params = {
        token,
        message,
        type: 0,
        destination: phone,
        source: RML_SOURCE,
        entityid: RML_ENTITY_ID,
        tempid: RML_TEMP_ID_ADMIN_BOOKING
      };

      const response = await axios.get(url, { params, responseType: "text" });
      const result = response.data.trim();
      const code = result.split("|")[0];

      results.push({
        phone,
        raw: result,
        code,
        message: smsMessages[code] || "Unknown response"
      });
    }

    // Return first result for compatibility, or summary
    return results.length > 1 ? { multi: true, results } : results[0];
  } catch (err) {
    console.error("❌ sendAdminBookingSms error:", err.message || err);
    throw new Error("Failed to send admin booking SMS");
  }
}
