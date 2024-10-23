<<<<<<< HEAD
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files (serve HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword',  // Replace with your Gmail credentials
    }
});

// Store the verification codes in-memory (in a real app, use a database)
const verificationCodes = {};

// Function to generate random 6-digit authentication code
function generateAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a 6-digit code
}

// Send email with the verification code
function sendAuthCode(email, code) {
    const mailOptions = {
        from: 'youremail@gmail.com',
        to: email,
        subject: 'Your Password Reset Code',
        text: `Your password reset code is: ${code}`,
    };

    return transporter.sendMail(mailOptions);
}

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle sending the email with the code
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const authCode = generateAuthCode();  // Generate a random code

    // Store the auth code with the email as key (in-memory)
    verificationCodes[email] = authCode;

    // Send the email
    sendAuthCode(email, authCode)
        .then(() => {
            res.status(200).send({ message: 'Code sent to your email' });
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        });
});

// Route to handle verifying the authentication code
app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    // Check if the code matches the one sent to the user
    if (verificationCodes[email] === code) {
        res.status(200).send({ message: 'Code verified successfully' });
    } else {
        res.status(400).send({ message: 'Invalid or expired code' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
=======
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files (serve HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword',  // Replace with your Gmail credentials
    }
});

// Store the verification codes in-memory (in a real app, use a database)
const verificationCodes = {};

// Function to generate random 6-digit authentication code
function generateAuthCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a 6-digit code
}

// Send email with the verification code
function sendAuthCode(email, code) {
    const mailOptions = {
        from: 'youremail@gmail.com',
        to: email,
        subject: 'Your Password Reset Code',
        text: `Your password reset code is: ${code}`,
    };

    return transporter.sendMail(mailOptions);
}

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle sending the email with the code
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const authCode = generateAuthCode();  // Generate a random code

    // Store the auth code with the email as key (in-memory)
    verificationCodes[email] = authCode;

    // Send the email
    sendAuthCode(email, authCode)
        .then(() => {
            res.status(200).send({ message: 'Code sent to your email' });
        })
        .catch((error) => {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        });
});

// Route to handle verifying the authentication code
app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    // Check if the code matches the one sent to the user
    if (verificationCodes[email] === code) {
        res.status(200).send({ message: 'Code verified successfully' });
    } else {
        res.status(400).send({ message: 'Invalid or expired code' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
>>>>>>> 18249aded329655e6424cad5532225a41e3d0ef7
