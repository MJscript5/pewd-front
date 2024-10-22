// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Replace with your email credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

app.post('/send-code', (req, res) => {
    const email = req.body.email;
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit verification code

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Email Verification Code',
        text: `Your verification code is: ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Failed to send verification code.' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
