import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();


// Create a transporter using Gmail SMTP
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'mail.privateemail.com',
    port: process.env.EMAIL_PORT || 587, // or 465 if using SSL
    secure: process.env.EMAIL_SECURE === 'true', // use SSL for port 465
    auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS   // Replace with your email password
    }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, 'template.html');
let templateContent = fs.readFileSync(templatePath, 'utf8');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: '*',  // Allow all origins for testing; restrict this in production
    methods: ['GET', 'POST'],  // Ensure POST is included
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.post('/contact-us', (req, res) => {
    const requiredFields = [
        { field: 'fullname', desc: 'Full name' },
        { field: 'email', desc: 'Email address' },
        { field: 'phone', desc: 'Phone number' },
        { field: 'subject', desc: 'Subject' },
        { field: 'message', desc: 'Message' }
    ];
    const missingFields = requiredFields.filter(item => !req.body[item.field] || req.body[item.field].trim() === '').map(res=> res.desc);

    if (missingFields.length > 0) {
        return res.status(400).send({
            success: false,
            error: 'The following fields are required: ' + missingFields.join(', ')
        });
    }
    const {
        fullname, 
        email ,
        phone ,
        subject ,
        message ,
    } = req.body;

    templateContent = templateContent.replace("{{NAME}}", fullname);
    templateContent = templateContent.replace("{{SUBJECT}}", subject);
    templateContent = templateContent.replace("{{MESSAGE}}", message);
    templateContent = templateContent.replace("{{FROM}}", "support@180beeitsolutions.com");

    let mailOptions = {
        from: `"${process.env.EMAIL_FROM}" <${process.env.EMAIL_USER}>`, // Sender address
        to: email,
        subject: `Message: ${subject}`, // Subject line
        html: templateContent
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).send({
                success: false,
                error: error.toString()
            });
        }
        res.status(200).send({
            success: true
        });
    });
});

app.listen(port, () => {
    console.log(`Email service listening at http://localhost:${port}`);
});