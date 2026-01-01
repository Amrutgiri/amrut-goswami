const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'],
        default: 'Full-time'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    isCurrent: {
        type: Boolean,
        default: false
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

// Virtual field for duration display (optional but helpful)
experienceSchema.virtual('duration').get(function () {
    const start = this.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const end = this.isCurrent ? 'Present' : (this.endDate ? this.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
    return `${start} – ${end}`;
});

module.exports = mongoose.model("Experience", experienceSchema);
