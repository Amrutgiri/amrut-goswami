const Education = require("../../models/Education");

// ========================================
// PAGE RENDERING
// ========================================

// Display Education Management Page
exports.educationPage = async (req, res) => {
    try {
        res.render("admin/education", {
            layout: "layouts/admin",
            title: "Education Management"
        });
    } catch (error) {
        console.error("Error loading education page:", error);
        res.status(500).send("Server Error");
    }
};

// ========================================
// API ENDPOINTS (JSON Responses)
// ========================================

// Get All Education Entries
exports.getEducationAPI = async (req, res) => {
    try {
        // Sort by start year (newest first)
        const education = await Education.find().sort({ startYear: -1 });
        res.json(education);
    } catch (error) {
        console.error("Error fetching education:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch education entries"
        });
    }
};

// Get Single Education by ID
exports.getEducationById = async (req, res) => {
    try {
        const { id } = req.params;
        const education = await Education.findById(id);

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education entry not found"
            });
        }

        res.json({
            success: true,
            education
        });
    } catch (error) {
        console.error("Error fetching education:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch education details"
        });
    }
};

// Create New Education
exports.createEducationAPI = async (req, res) => {
    try {
        const { degree, institution, fieldOfStudy, startYear, endYear, grade, description, isActive } = req.body;

        const isCurrent = !endYear;

        if (!degree || !institution || !startYear) {
            return res.status(400).json({
                success: false,
                message: "Degree, Institution, and Start Year are required"
            });
        }

        const newEducation = await Education.create({
            degree: degree.trim(),
            institution: institution.trim(),
            fieldOfStudy: fieldOfStudy?.trim(),
            startYear: Number(startYear),
            endYear: endYear ? Number(endYear) : null,
            isCurrent,
            grade: grade?.trim(),
            description: description?.trim(),
            isActive: isActive === 'on' || isActive === 'true' || isActive === true
        });

        res.status(201).json({
            success: true,
            message: "Education added successfully!",
            education: newEducation
        });
    } catch (error) {
        console.error("Error creating education:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add education"
        });
    }
};

// Update Education
exports.updateEducationAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { degree, institution, fieldOfStudy, startYear, endYear, grade, description, isActive } = req.body;

        const isCurrent = !endYear;

        if (!degree || !institution || !startYear) {
            return res.status(400).json({
                success: false,
                message: "Degree, Institution, and Start Year are required"
            });
        }

        const updatedEducation = await Education.findByIdAndUpdate(
            id,
            {
                degree: degree.trim(),
                institution: institution.trim(),
                fieldOfStudy: fieldOfStudy?.trim(),
                startYear: Number(startYear),
                endYear: endYear ? Number(endYear) : null,
                isCurrent,
                grade: grade?.trim(),
                description: description?.trim(),
                isActive: isActive === 'on' || isActive === 'true' || isActive === true
            },
            { new: true, runValidators: true }
        );

        if (!updatedEducation) {
            return res.status(404).json({
                success: false,
                message: "Education entry not found"
            });
        }

        res.json({
            success: true,
            message: "Education updated successfully!",
            education: updatedEducation
        });
    } catch (error) {
        console.error("Error updating education:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update education"
        });
    }
};

// Delete Education
exports.deleteEducationAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEducation = await Education.findByIdAndDelete(id);

        if (!deletedEducation) {
            return res.status(404).json({
                success: false,
                message: "Education entry not found"
            });
        }

        res.json({
            success: true,
            message: "Education deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting education:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete education"
        });
    }
};

// Toggle Status
exports.toggleEducationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const education = await Education.findById(id);

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education entry not found"
            });
        }

        education.isActive = !education.isActive;
        await education.save();

        res.json({
            success: true,
            message: `Education ${education.isActive ? 'activated' : 'deactivated'} successfully!`,
            education
        });
    } catch (error) {
        console.error("Error toggling status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
};
