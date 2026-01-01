const About = require("../models/About");
const Skill = require("../models/Skill");
const Project = require("../models/Project");
const Experience = require("../models/Experience");
const Education = require("../models/Education");

exports.home = async (req, res) => {
    try {
        const about = await About.findOne(); // only one profile
        const skills = await Skill.find({ isActive: true }).sort({ name: 1 });

        // Fetch Projects (Active, sorted by displayOrder or descending date as fallback)
        const projects = await Project.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });

        // Fetch Experience (Active, sorted by start date descending)
        const experiences = await Experience.find({ isActive: true }).sort({ startDate: -1 });

        // Fetch Education (Active, sorted by start year descending)
        const education = await Education.find({ isActive: true }).sort({ startYear: -1 });

        // Fetch Services (Active, sorted by title or custom order if available)
        const services = await require("../models/Service").find({ isActive: true }).sort({ title: 1 });

        res.render("frontend/home", {
            title: "My Portfolio",
            about,
            skills,
            projects,
            experiences,
            education,
            services,
            recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Default Test Key
        });
    } catch (error) {
        console.error("Error loading frontend home:", error);
        res.status(500).send("Server Error");
    }
}


// Helper to verify reCAPTCHA
async function verifyRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // TEST KEY if not set
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    try {
        const response = await fetch(verifyUrl, { method: 'POST' });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("reCAPTCHA Verification Error:", error);
        return false;
    }
}

exports.sendMessage = async (req, res) => {
    try {
        const { name, email, subject, message, 'g-recaptcha-response': captchaToken } = req.body;
        const Message = require("../models/Message");

        // 1. Basic Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // 2. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        // 3. CAPTCHA Verification
        if (!captchaToken) {
            return res.status(400).json({ success: false, message: "Please complete the CAPTCHA." });
        }

        const isCaptchaValid = await verifyRecaptcha(captchaToken);
        if (!isCaptchaValid) {
            return res.status(400).json({ success: false, message: "CAPTCHA verification failed. Please try again." });
        }

        // 4. Save Message
        await Message.create({
            name,
            email,
            subject,
            message,
            isRead: false
        });

        res.json({ success: true, message: "Message sent successfully!" });

    } catch (error) {
        console.error("SendMessage Error:", error);
        res.status(500).json({ success: false, message: "Server Error. Please try again later." });
    }
};
