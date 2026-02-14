import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Load .env file

export const sendEmail = async (email, subject, htmlMessage) => {
  console.log("Attempting to send email to:", email);
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",  // Hardcoded to ensure it uses Brevo
      port: 587,
      secure: false,
      auth: {
        // USE THE NEW NAMES HERE
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      }
    });

    const result = await transporter.sendMail({
      from: `"Men's Stitch" <${process.env.SMTP_USER}>`, 
      to: email,
      subject: subject,
      text: 'Hello User', 
      html: htmlMessage
    });

    console.log("Email sent successfully. ID:", result.messageId);
    return true;

  } catch (error) {
    console.error("Email Error:", error);
    return false;
  }
};