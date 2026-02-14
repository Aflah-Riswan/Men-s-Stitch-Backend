import nodemailer from 'nodemailer';

export const sendEmail = async (email, subject, htmlMessage) => {
  console.log("email :  ", email);
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      host: process.env.HOST,
      port: 465,
      secure: true, 
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
    return true

  } catch (error) {
    console.log(error);
    return false
  }
};