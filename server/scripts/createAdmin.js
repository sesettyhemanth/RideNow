
require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createAdmin() {
  const [, , emailArg, passwordArg] = process.argv;

  const email = emailArg || (await ask('Admin email: '));
  const password = passwordArg || (await ask('Admin password: '));

  if (!email || !password) {
    console.error('Both an email and a password are required.');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  await connectDB();

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

  if (existingAdmin) {
    // the pre('save') hook on the Admin model re-hashes this automatically
    existingAdmin.password = password;
    await existingAdmin.save();
    console.log(`Updated the password for existing admin: ${email}`);
  } else {
    await Admin.create({ email, password });
    console.log(`Created new admin account: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Could not create the admin account:', err.message);
  process.exit(1);
});
