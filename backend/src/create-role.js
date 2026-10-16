import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
const [role,name,email,password]=process.argv.slice(2);
if(!['officer','researcher'].includes(role)||!name||!email||!password||password.length<12){console.error('Usage: node src/create-role.js officer|researcher "Full Name" email@example.com "StrongPassword12"');process.exit(1);}
const conn=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'cropcare'});
try{await conn.execute('INSERT INTO users(full_name,email,password_hash,role) VALUES (?,?,?,?)',[name,email.trim().toLowerCase(),await bcrypt.hash(password,12),role]);console.log(`${role} account created`)}finally{await conn.end()}
