import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/user.model";

const bootstrapAdmin = async () => {
  const {
    MONGODB_URI,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    ADMIN_DISPLAY_NAME,
  } = process.env;

  if (
    !MONGODB_URI ||
    !ADMIN_EMAIL ||
    !ADMIN_PASSWORD ||
    !ADMIN_USERNAME ||
    !ADMIN_DISPLAY_NAME
  ) {
    throw new Error(
      "MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME and ADMIN_DISPLAY_NAME are required"
    );
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const username = ADMIN_USERNAME.trim();

  await mongoose.connect(MONGODB_URI)
  .then(()=> console.log("Connected to MongoDB"))
  .catch(e=>{throw e});

  const existingUser = await User.findOne({ email });

  // Idempotent: admin already exists → do nothing
  if (existingUser) {
    if (existingUser.status !== "active") {
      throw new Error(
        `Admin user exists but is ${existingUser.status}. Activate the user manually first.`
      );
    }

    if (existingUser.role === "admin") {
      console.log("Admin already exists. Nothing to do.");
      return;
    }

    // Existing active user → promote to admin
    existingUser.role = "admin";
    await existingUser.save();

    console.log(`Existing user ${email} promoted to admin.`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    email,
    username,
    displayName: ADMIN_DISPLAY_NAME.trim(),
    passwordHash,
    authProviders: ["password"],
    emailVerifiedAt: new Date(),
    role: "admin",
    status: "active",
  });

  console.log(`Admin created successfully: ${email}`);
};

bootstrapAdmin()
  .then(()=> console.log("Admin bootstrap script successfully executed"))
  .catch((error) => {
    console.error("Admin bootstrap failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });