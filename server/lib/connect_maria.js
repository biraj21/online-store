import { Store } from "express-session";

export default class MariaStore extends Store {
    constructor(dbPool) {
        super();
        this.dbPool = dbPool;
        this.createTable();
    }

    async createTable() {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            return await conn.query(
                `CREATE TABLE IF NOT EXISTS \`session\` (
                \`id\` varchar(100) NOT NULL,
                \`sess\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(\`sess\`)),
                \`expires\` timestamp NOT NULL,
                UNIQUE KEY \`session_UN\` (\`id\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
            );
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.release();
        }
    }

    async get(sid, callback) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            const rows = await conn.query("SELECT * FROM `session` WHERE id = ?", [sid]);
            if (rows.length == 0) {
                callback(null, null);
                return;
            }

            callback(null, rows[0].sess);
        } catch (err) {
            callback(err, null);
        } finally {
            if (conn) conn.release();
        }
    }

    async set(sid, sess, callback) {
        let conn;
        try {
            this.get(sid, async (err, gotSess) => {
                if (err) {
                    callback(err);
                    return;
                }

                let insert = gotSess === null;

                let expires;
                if (sess.cookie.originalMaxAge) {
                    expires = new Date(Date.now() + sess.cookie.originalMaxAge);
                } else {
                    expires = new Date();
                }

                conn = await this.dbPool.getConnection();
                if (insert) {
                    await conn.query("INSERT INTO `session` VALUES (?, ?, ?)", [
                        sid,
                        JSON.stringify(sess),
                        expires,
                    ]);
                } else {
                    await conn.query("UPDATE `session` SET sess = ?, expires = ? WHERE id = ?", [
                        JSON.stringify(sess),
                        expires,
                        sid,
                    ]);
                }

                callback(null);
            });
        } catch (err) {
            callback(err);
        } finally {
            if (conn) conn.release();
        }
    }

    async destroy(sid, callback) {
        let conn;
        try {
            conn = await this.dbPool.getConnection();
            await conn.query("DELETE from `session` WHERE id = ?", [sid]);
            callback(null);
        } catch (err) {
            callback(err);
        } finally {
            if (conn) conn.release();
        }
    }
}
