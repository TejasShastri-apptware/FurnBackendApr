// import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;


let curr = null;
// curr = process.env.MYSQL_URL;
curr = process.env.SUPABASE_URL;
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(client => {
    console.log("Connected to supabase POSTGRES");
    client.release();
  })
  .catch(err => {
    console.log("Supabase connection failed");
})


// pool.getConnection()
//   .then(connection => { 
//     // console.log("Database connected successfully");
//     if(curr) console.log("Database running on railway");
//     else console.log("Database running locally(furn2)")
//     connection.release();
//   })
//   .catch(err => {
//     console.error("Database connection failed:", err.message);
//   });

export default pool;

// why pool:
// Reuse connections, handle concurrency, prevents exhausting mysql threads