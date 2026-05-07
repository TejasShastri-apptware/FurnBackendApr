import pool from "../config/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

async function migratePasswords() {
    console.log("Starting password migration...");
    const client = await pool.connect();
    try {
        const { rows: users } = await client.query("SELECT user_id, password_hash FROM users");
        let count = 0;

        for (const user of users) {
            // Check if it's already a bcrypt hash (starts with $2)
            if (user.password_hash && !user.password_hash.startsWith('$2')) {
                const hashed = await bcrypt.hash(user.password_hash, 10);
                await client.query("UPDATE users SET password_hash = $1 WHERE user_id = $2", [hashed, user.user_id]);
                count++;
            }
        }
        console.log(`Successfully migrated ${count} passwords to bcrypt.`);
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

migratePasswords();