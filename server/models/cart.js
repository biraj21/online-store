import dbPool from "../utils/database.js";

export default class Cart {
    static async addItem(productId, quantity, userId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("INSERT INTO `cart` VALUES (?, ?, ?)", [
                productId,
                quantity,
                userId,
            ]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getItemsByUserId(userId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query(
                `SELECT p.id, p.name, p.imageUrl, p.price, c.quantity
                 FROM \`cart\` c
                 JOIN \`product\` p
                    ON c.productId = p.id
                 WHERE c.userId = ?`,
                [userId]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async removeItem(productId, userId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("DELETE FROM `cart` WHERE userId = ? AND productId = ?", [
                productId,
                userId,
            ]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteByUserId(userId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("DELETE FROM `cart` WHERE userId = ?", [userId]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}
