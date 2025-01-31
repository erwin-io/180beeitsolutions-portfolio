import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';

// Create a transporter using Gmail SMTP
let transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587 , // or 465 if using SSL
    secure: false, // use SSL for port 465
    auth: {
        user: 'support@180beeitsolutions.com', // Replace with your email
        pass: '=s8GQ$fT58zWK##'   // Replace with your email password
    }
});
// Read the HTML template
const __dirname = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).substring(1));
const templatePath = path.join(__dirname, 'template.html');
let templateContent = fs.readFileSync(templatePath, 'utf8');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post('/contact-us', (req, res) => {
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
        from: '"180bee IT Solutions Support" <support@180beeitsolutions.com>', // Sender address
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