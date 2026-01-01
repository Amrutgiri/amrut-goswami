const Skill = require("../../models/Skill");

// ========================================
// PAGE RENDERING
// ========================================

// Display Skills Management Page
exports.skillsPage = async (req, res) => {
    try {
        res.render("admin/skills", {
            layout: "layouts/admin",
            title: "Skills Management"
        });
    } catch (error) {
        console.error("Error loading skills page:", error);
        res.status(500).send("Server Error");
    }
};

// ========================================
// API ENDPOINTS (JSON Responses)
// ========================================

// Get All Skills (for DataTables)
exports.getSkillsAPI = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.json(skills);
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch skills"
        });
    }
};

// Get Single Skill by ID
exports.getSkillById = async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await Skill.findById(id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        res.json({
            success: true,
            skill
        });
    } catch (error) {
        console.error("Error fetching skill:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch skill"
        });
    }
};

// Create New Skill (API)
exports.createSkillAPI = async (req, res) => {
    try {
        const { name, category, level, icon, isActive } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill name is required"
            });
        }

        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        if (level === undefined || level === null) {
            return res.status(400).json({
                success: false,
                message: "Skill level is required"
            });
        }

        const skillLevel = parseInt(level);
        if (isNaN(skillLevel) || skillLevel < 0 || skillLevel > 100) {
            return res.status(400).json({
                success: false,
                message: "Skill level must be between 0 and 100"
            });
        }

        // Check for duplicate skill name (case-insensitive)
        const existingSkill = await Skill.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingSkill) {
            return res.status(400).json({
                success: false,
                message: "A skill with this name already exists"
            });
        }

        // Create skill
        const skill = await Skill.create({
            name: name.trim(),
            category: category.trim(),
            level: skillLevel,
            icon: icon || 'bx bx-code-alt',
            isActive: isActive === true || isActive === 'true'
        });

        res.status(201).json({
            success: true,
            message: "Skill added successfully!",
            skill
        });
    } catch (error) {
        console.error("Error creating skill:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add skill. Please try again."
        });
    }
};

// Update Skill (API)
exports.updateSkillAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, level, icon, isActive } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill name is required"
            });
        }

        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        if (level === undefined || level === null) {
            return res.status(400).json({
                success: false,
                message: "Skill level is required"
            });
        }

        const skillLevel = parseInt(level);
        if (isNaN(skillLevel) || skillLevel < 0 || skillLevel > 100) {
            return res.status(400).json({
                success: false,
                message: "Skill level must be between 0 and 100"
            });
        }

        // Check if skill exists
        const existingSkill = await Skill.findById(id);
        if (!existingSkill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        // Check for duplicate name (excluding current skill)
        const duplicateSkill = await Skill.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (duplicateSkill) {
            return res.status(400).json({
                success: false,
                message: "A skill with this name already exists"
            });
        }

        // Update skill
        const updatedSkill = await Skill.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                category: category.trim(),
                level: skillLevel,
                icon: icon || 'bx bx-code-alt',
                isActive: isActive === true || isActive === 'true'
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Skill updated successfully!",
            skill: updatedSkill
        });
    } catch (error) {
        console.error("Error updating skill:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update skill. Please try again."
        });
    }
};

// Delete Skill (API)
exports.deleteSkillAPI = async (req, res) => {
    try {
        const { id } = req.params;

        const skill = await Skill.findById(id);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        await Skill.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Skill deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting skill:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete skill. Please try again."
        });
    }
};

// Toggle Skill Status (API)
exports.toggleSkillStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const skill = await Skill.findById(id);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        // Toggle the status
        skill.isActive = !skill.isActive;
        await skill.save();

        res.json({
            success: true,
            message: `Skill ${skill.isActive ? 'activated' : 'deactivated'} successfully!`,
            skill
        });
    } catch (error) {
        console.error("Error toggling skill status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle skill status. Please try again."
        });
    }
};
