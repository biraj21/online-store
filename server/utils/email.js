import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transpoter = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export default async function sendEmail(options) {
    try {
        return await transpoter.sendMail({
            from: "Node Shop <no-reply@nodeshop.com>",
            ...options,
        });
    } catch (err) {
        console.error(err);
    }
}
