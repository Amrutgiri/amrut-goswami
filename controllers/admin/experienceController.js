const Experience = require("../../models/Experience");

// ========================================
// PAGE RENDERING
// ========================================

// Display Experience Management Page
exports.experiencePage = async (req, res) => {
    try {
        res.render("admin/experience", {
            layout: "layouts/admin",
            title: "Experience Management"
        });
    } catch (error) {
        console.error("Error loading experience page:", error);
        res.status(500).send("Server Error");
    }
};

// ========================================
// API ENDPOINTS (JSON Responses)
// ========================================

// Get All Experience Entries (for DataTables)
exports.getExperiencesAPI = async (req, res) => {
    try {
        // Sort by start date (newest first)
        const experiences = await Experience.find().sort({ startDate: -1 });
        res.json(experiences);
    } catch (error) {
        console.error("Error fetching experiences:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch experience entries"
        });
    }
};

// Get Single Experience by ID
exports.getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await Experience.findById(id);

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found"
            });
        }

        res.json({
            success: true,
            experience
        });
    } catch (error) {
        console.error("Error fetching experience:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch experience details"
        });
    }
};

// Create New Experience
exports.createExperienceAPI = async (req, res) => {
    try {
        const { companyName, role, location, type, startDate, endDate, isActive } = req.body;

        // Handle 'Currently Working Here' checkbox
        // The frontend sends 'on' if checked, or nothing if unchecked. 
        // We might also receive explicit boolean or string 'true' depending on how we handle it in JS.
        // Assuming we look at the checkbox presence primarily for the logic or a hidden field.
        // Let's rely on payload. But wait, forms with `disabled` inputs don't send their value.
        // We'll check the 'endDate' value. If it's provided, user is not working there (mostly).
        // Actually, checking the "currently working" checkbox name is safer if we add it to the FormData.

        // Better approach: Check if 'endDate' is Present/Empty or logic based on a flag.
        // In the View, we didn't give the checkbox a name attribute for 'isCurrent'. 
        // FIX: We need to ensure frontend handles this or we infer it. 
        // Let's assume we update frontend to send 'isCurrent' or we infer: if no endDate, it's current.

        // WAIT: The user request included `check box "Currently Working Here"`. 
        // I should treat empty endDate as isCurrent = true if that's the intention.

        const isCurrent = !endDate;

        if (!companyName || !role || !startDate) {
            return res.status(400).json({
                success: false,
                message: "Company name, role, and start date are required"
            });
        }

        const newExperience = await Experience.create({
            companyName: companyName.trim(),
            role: role.trim(),
            location: location?.trim(),
            type,
            startDate,
            endDate: endDate || null,
            isCurrent,
            description: req.body.description?.trim(),
            isActive: isActive === 'on' || isActive === 'true' || isActive === true
        });

        res.status(201).json({
            success: true,
            message: "Experience added successfully!",
            experience: newExperience
        });
    } catch (error) {
        console.error("Error creating experience:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add experience"
        });
    }
};

// Update Experience
exports.updateExperienceAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyName, role, location, type, startDate, endDate, isActive } = req.body;

        const isCurrent = !endDate;

        if (!companyName || !role || !startDate) {
            return res.status(400).json({
                success: false,
                message: "Company name, role, and start date are required"
            });
        }

        const updatedExperience = await Experience.findByIdAndUpdate(
            id,
            {
                companyName: companyName.trim(),
                role: role.trim(),
                location: location?.trim(),
                type,
                startDate,
                endDate: endDate || null,
                isCurrent,
                description: req.body.description?.trim(),
                isActive: isActive === 'on' || isActive === 'true' || isActive === true
            },
            { new: true, runValidators: true }
        );

        if (!updatedExperience) {
            return res.status(404).json({
                success: false,
                message: "Experience entry not found"
            });
        }

        res.json({
            success: true,
            message: "Experience updated successfully!",
            experience: updatedExperience
        });
    } catch (error) {
        console.error("Error updating experience:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update experience"
        });
    }
};

// Delete Experience
exports.deleteExperienceAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExperience = await Experience.findByIdAndDelete(id);

        if (!deletedExperience) {
            return res.status(404).json({
                success: false,
                message: "Experience entry not found"
            });
        }

        res.json({
            success: true,
            message: "Experience deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting experience:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete experience"
        });
    }
};

// Toggle Status
exports.toggleExperienceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await Experience.findById(id);

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience entry not found"
            });
        }

        experience.isActive = !experience.isActive;
        await experience.save();

        res.json({
            success: true,
            message: `Experience ${experience.isActive ? 'activated' : 'deactivated'} successfully!`,
            experience
        });
    } catch (error) {
        console.error("Error toggling status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
};
