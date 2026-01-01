require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📡 Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: "apgoswami1008@gmail.com" });

        if (existingAdmin) {
            console.log("⚠️  Admin already exists. Updating password...");
            existingAdmin.password = "Password@0907";
            await existingAdmin.save();
            console.log("✅ Admin password updated successfully!");
        } else {
            // Create new admin
            await Admin.create({
                email: "apgoswami1008@gmail.com",
                password: "Password@0907"
            });
            console.log("✅ Admin created successfully!");
        }

        console.log("\n📧 Email: apgoswami1008@gmail.com");
        console.log("🔑 Password: Password@0907");

        // Close connection
        await mongoose.connection.close();
        console.log("\n✨ Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
