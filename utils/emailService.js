const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bhumix613@gmail.com',
        pass: 'hgjb vdfo twun eeda'  
    }
});

async function sendOTPEmail(to, otp) {
    const mailOptions = {
        from: 'bhumix613@gmail.com',
        to,
        subject: 'Your OTP Code',
        text: `Your verification OTP is ${otp}. It expires in 1 minute.`
    };
    await transporter.sendMail(mailOptions);
}

module.exports = sendOTPEmail;
