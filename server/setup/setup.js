import fs from "node:fs";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mariadb from "mariadb";
import { normalizeEmail } from "../utils/helpers.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

let conn;
try {
    conn = await mariadb.createConnection({
        hostname: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
    });

    // creating database and tables
    await conn.query(fs.readFileSync("./server/setup/db.sql", "utf-8"));

    // creating a default user
    const hashedPassword = bcrypt.hashSync(process.env.USER_PASSWORD, 12);
    await conn.query("INSERT INTO `user` (name, email, password, type) VALUES (?, ?, ?, ?)", [
        process.env.USER_NAME,
        normalizeEmail(process.env.USER_EMAIL),
        hashedPassword,
        "admin",
    ]);

    // adding products
    await conn.query(
        "INSERT INTO `product` (name, price, description, imageUrl, userId) VALUES ('Shoe Dogs', 350.0, 'In this candid and riveting memoir, for the first time ever, Nike founder and CEO Phil Knight shares the inside story of the company’s early days as an intrepid start-up and its evolution into one of the world’s most iconic, game-changing, and profitable brands.', 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1457284880l/27220736.jpg', 1)"
    );
    await conn.query(
        "INSERT INTO `product` (name, price, description, imageUrl, userId) VALUES ('Classroom of the Elite (Light Novel) Vol. 1', 459.0, 'Students of the prestigious Tokyo Metropolitan Advanced Nurturing High School are given remarkable freedom—if they can win, barter, or save enough points to work their way up the ranks! Ayanokoji Kiyotaka has landed at the bottom in the scorned Class D, where he meets Horikita Suzune, who’s determined to rise up the ladder to Class A. Can they beat the system in a school where cutthroat competition is the name of the game?', 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1540974678l/41085104.jpg', 1)"
    );

    console.log("Setup complete.");
} catch (err) {
    console.error("Error:", err.message);
} finally {
    if (conn) {
        conn.end();
    }
}
