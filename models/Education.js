const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
    degree: {
        type: String,
        required: true,
        trim: true
    },
    institution: {
        type: String,
        required: true,
        trim: true
    },
    fieldOfStudy: {
        type: String,
        trim: true
    },
    startYear: {
        type: Number,
        required: true
    },
    endYear: {
        type: Number
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    grade: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Education", educationSchema);
