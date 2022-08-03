import bcrypt from "bcrypt";
import dbPool from "../utils/database.js";

export default class User {
    static async create(data) {
        const { name, email, password } = data;

        let conn;
        try {
            conn = await dbPool.getConnection();

            const hashedPassword = await bcrypt.hash(password, 12);
            return await conn.query("INSERT INTO `user` (name, email, password) VALUES (?, ?, ?)", [
                name,
                email,
                hashedPassword,
            ]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getById(id) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return (await conn.query("SELECT * FROM `user` WHERE id = ?", [id]))[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getByEmail(email) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return (await conn.query("SELECT * FROM `user` WHERE email = ?", [email]))[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async updatePasswordByEmail(password, email) {
        let conn;
        try {
            conn = await dbPool.getConnection();

            const hashedPassword = await bcrypt.hash(password, 12);
            return await conn.query("UPDATE `user` SET password = ? WHERE email = ?", [
                hashedPassword,
                email,
            ]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}
