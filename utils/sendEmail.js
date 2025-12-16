import nodemailer from 'nodemailer';

export const sendEmail = async (email, subject, htmlMessage) => {
  console.log("email :  ", email);
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      host: process.env.HOST,
      port: 587,
      secure: false, 
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
      }
    });

    const result = await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: 'Hello User', 
      html: htmlMessage
    });

    console.log(result);
    console.log("email send succesfully");
    return { success: true, message: 'email send succesfully' };

  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};