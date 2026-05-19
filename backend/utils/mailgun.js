import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,   // 🔑 API Key
  url: "https://api.mailgun.net",     // Default
});

export const sendMail = async (to, subject, text, html) => {
  return mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `BhaoBhao <no-reply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    text,
    html
  });
};
