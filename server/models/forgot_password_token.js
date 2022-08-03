import dbPool from "../utils/database.js";

export default class ForgotPasswordToken {
    static async create(data) {
        const { email, token, expires } = data;

        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("INSERT INTO `forgot_password_token` VALUES (?, ?, ?)", [
                email,
                token,
                expires,
            ]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getByToken(token) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return (
                await conn.query("SELECT * FROM `forgot_password_token` WHERE token = ?", [token])
            )[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getByEmailAndToken(email, token) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return (
                await conn.query(
                    "SELECT * FROM `forgot_password_token` WHERE email = ? AND token = ?",
                    [email, token]
                )
            )[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteByEmail(email) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("DELETE FROM `forgot_password_token` WHERE email = ?", [email]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteByToken(token) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("DELETE FROM `forgot_password_token` WHERE token = ?", [token]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}
