import nodemailer from "nodemailer";

const sendEmail = async (email, resetPasswordURL) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.YOUR_EMAIL,
      pass: process.env.YOUR_EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.YOUR_EMAIL,
    to: email,
    subject: "Your resetPasswordURL code",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
      <p style="font-size: 18px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">Your resetPasswordURL code is:</p>
      <h1 style="font-size: 32px; color: #0073e6; text: center;">${resetPasswordURL}</h1>
      <p style="font-size: 16px; color: #333;">Use this code to verify your account.</p>
      <p style="font-size: 16px; color: #333;">Thank you for choosing our service.</p>
      <p style="font-size: 16px; color: #333;">Sincerely, Your Service Team</p>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

export default sendEmail;
