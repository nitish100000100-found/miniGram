import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process?.env?.EMAIL_USER,
    clientId: process?.env?.CLIENT_ID,
    clientSecret: process?.env?.CLIENT_SECRET,
    refreshToken: process?.env?.REFRESH_TOKEN,
  },
});
  

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


const sendEmail = async (to) => {
  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    const info = await transporter.sendMail({
      from: `"miniGram" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify Your Email - miniGram",
      text: `Your OTP is ${otp}`,

      html: `
        <h2>miniGram Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p>Do not share this code with anyone.</p>
      `,
    });

    

    return otp;
  } catch (error) {

    return null;
  }
};

export default sendEmail;