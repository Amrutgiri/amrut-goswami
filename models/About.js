const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    professionalTitle: {
        type: String,
        required: true
    },
    shortBio: {
        type: String,
        required: true
    },
    profileImage: {
        public_id: String,
        url: String
    },
    resume: {
        public_id: String,
        url: String
    },
    socialLinks: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        youtube: { type: String, trim: true }
    }
}, { timestamps: true });

module.exports = mongoose.model("About", aboutSchema);
