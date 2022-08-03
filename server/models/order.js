import dbPool from "../utils/database.js";

export default class Order {
    static async create(data) {
        const { cart, userId } = data;

        let conn;
        try {
            conn = await dbPool.getConnection();

            const result = [];
            result.push(await conn.query("INSERT INTO `order` (userId) VALUES (?)", [userId]));
            result.push(await OrderItem.create({ cart, orderId: result[0].insertId }));

            return result;
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
            return await conn.query(
                `SELECT o.id, o.orderDate, o.userId, u.name userName, u.email userEmail
                FROM \`order\` o
                JOIN \`user\` u
                    ON o.userId = u.id`
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllByUserId(userId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query("SELECT id, orderDate FROM `order` WHERE userId = ?", [userId]);
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
            const order = (
                await conn.query(
                    `SELECT o.id, o.orderDate, o.userId, u.name userName, u.email userEmail
                    FROM \`order\` o
                    JOIN \`user\` u
                        ON o.userId = u.id
                    WHERE o.id = ?`,
                    [id]
                )
            )[0];

            if (!order) return order;

            order.items = await OrderItem.getAllByOrderId(id);
            return order;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getByIdAndUser(id, userId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            const order = (
                await conn.query("SELECT id, orderDate FROM `order` WHERE id = ? AND userId = ?", [
                    id,
                    userId,
                ])
            )[0];

            if (!order) return order;

            order.items = await OrderItem.getAllByOrderId(id);
            return order;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}

class OrderItem {
    static async create(data) {
        const { cart, orderId } = data;

        let conn;
        try {
            conn = await dbPool.getConnection();

            const result = [];
            for (const item of cart) {
                result.push(
                    await conn.query("INSERT INTO `order_item` VALUES (?, ?, ?, ?)", [
                        item.id,
                        item.price,
                        item.quantity,
                        orderId,
                    ])
                );
            }

            return result;
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getAllByOrderId(orderId) {
        let conn;
        try {
            conn = await dbPool.getConnection();
            return await conn.query(
                `SELECT p.id, p.name, oi.price, oi.quantity
                 FROM \`order_item\` oi
                 JOIN \`product\` p
                    ON oi.productId = p.id
                 WHERE oi.orderId = ?`,
                [orderId]
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }
}
