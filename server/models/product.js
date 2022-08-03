import dbPool from "../utils/database.js";

export default class Product {
    static async create(data) {
        const { name, price, description, imageUrl, userId } = data;

        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query(
                "INSERT INTO `product` (name, price, description, imageUrl, userId) VALUES (?, ?, ?, ?, ?)",
                [name, price, description, imageUrl, userId]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async existsId(id) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return (await conn.query("SELECT id FROM `product` WHERE id = ?", [id])).length > 0;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAll() {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("SELECT * FROM `product`");
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
            return (await conn.query("SELECT * FROM `product` WHERE id = ?", [id]))[0];
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async updateById(data, id) {
        const { name, price, description, imageUrl } = data;

        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query(
                "UPDATE `product` SET name = ?, price = ?, description = ?, imageUrl = ? WHERE id = ?",
                [name, price, description, imageUrl, id]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async deleteById(id) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("DELETE FROM `product` WHERE id = ?", [id]);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}
