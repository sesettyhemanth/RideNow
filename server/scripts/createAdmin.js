// SAVE THIS AS: server/scripts/createAdmin.js
// RUN FROM THE server FOLDER:
//   node scripts/createAdmin.js 'youradmin@email.com' 'YourPassword123'
// MONGODB_URI in server/.env must be the SAME Atlas URI that Render uses
// (same cluster AND same database name).
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function main() {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error("Usage: node scripts/createAdmin.js 'email' 'password'");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password must be at least 6 characters');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing in your .env file');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to database:', mongoose.connection.name);

  let admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (admin) {
    admin.password = password; // pre-save hook hashes it
    await admin.save();
    console.log('Admin already existed, password updated:', admin.email);
  } else {
    admin = await Admin.create({ email, password });
    console.log('Admin created:', admin.email);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('createAdmin failed:', err.message);
  process.exit(1);
});