const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String, // e.g., 'bx bxl-react' or 'bi bi-code'
        default: 'bx bx-code-alt'
    },
    level: {
        type: Number, // 0–100
        default: 0
    },
    category: {
        type: String, // frontend, backend, database, tools
        default: "general"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Skill", skillSchema);
