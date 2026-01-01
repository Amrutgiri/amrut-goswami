const Project = require("../../models/Project");
const cloudinary = require("../../config/cloudinary");

// ========================================
// PAGE RENDERING
// ========================================

// Display Projects Management Page
exports.projectsPage = async (req, res) => {
    try {
        res.render("admin/projects", {
            layout: "layouts/admin",
            title: "Projects Management"
        });
    } catch (error) {
        console.error("Error loading projects page:", error);
        res.status(500).send("Server Error");
    }
};

// ========================================
// API ENDPOINTS (JSON Responses)
// ========================================

// Get All Projects (for DataTables)
exports.getProjectsAPI = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects"
        });
    }
};

// Get Single Project by ID
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch project"
        });
    }
};

// Create New Project (API)
exports.createProjectAPI = async (req, res) => {
    try {
        const { title, description, techStack, liveUrl, githubUrl, isActive } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Project title is required"
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Project description is required"
            });
        }

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Project image is required"
            });
        }

        // Parse tech stack (comma-separated string to array)
        let techStackArray = [];
        if (techStack && techStack.trim()) {
            techStackArray = techStack.split(",").map(tech => tech.trim()).filter(tech => tech);
        }

        // Create project with Cloudinary image
        const project = await Project.create({
            title: title.trim(),
            description: description.trim(),
            techStack: techStackArray,
            image: {
                public_id: req.file.public_id,
                url: req.file.secure_url
            },
            liveUrl: liveUrl?.trim() || "",
            githubUrl: githubUrl?.trim() || "",
            isActive: isActive === 'on' || isActive === 'true' || isActive === true
        });

        res.status(201).json({
            success: true,
            message: "Project added successfully!",
            project
        });
    } catch (error) {
        console.error("Error creating project:", error);

        // If there was an error and file was uploaded, delete it from Cloudinary
        if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id);
            } catch (cleanupError) {
                console.error("Error cleaning up uploaded image:", cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to add project. Please try again."
        });
    }
};

// Update Project (API)
exports.updateProjectAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, techStack, liveUrl, githubUrl, isActive } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Project title is required"
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Project description is required"
            });
        }

        // Check if project exists
        const existingProject = await Project.findById(id);
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Parse tech stack
        let techStackArray = [];
        if (techStack && techStack.trim()) {
            techStackArray = techStack.split(",").map(tech => tech.trim()).filter(tech => tech);
        }

        // Prepare update data
        const updateData = {
            title: title.trim(),
            slug: title.trim().toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
            description: description.trim(),
            techStack: techStackArray,
            liveUrl: liveUrl?.trim() || "",
            githubUrl: githubUrl?.trim() || "",
            isActive: isActive === 'on' || isActive === 'true' || isActive === true
        };

        // If new image was uploaded, delete old one and update
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (existingProject.image && existingProject.image.public_id) {
                try {
                    await cloudinary.uploader.destroy(existingProject.image.public_id);
                } catch (cloudinaryError) {
                    console.error("Error deleting old image from Cloudinary:", cloudinaryError);
                }
            }

            // Add new image data
            updateData.image = {
                public_id: req.file.public_id,
                url: req.file.secure_url
            };
        }

        // Update project
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Project updated successfully!",
            project: updatedProject
        });
    } catch (error) {
        console.error("Error updating project:", error);

        // If there was an error and new file was uploaded, delete it from Cloudinary
        if (req.file && req.file.public_id) {
            try {
                await cloudinary.uploader.destroy(req.file.public_id);
            } catch (cleanupError) {
                console.error("Error cleaning up uploaded image:", cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to update project. Please try again."
        });
    }
};

// Delete Project (API)
exports.deleteProjectAPI = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Delete image from Cloudinary if it exists
        if (project.image && project.image.public_id) {
            try {
                await cloudinary.uploader.destroy(project.image.public_id);
            } catch (cloudinaryError) {
                console.error("Error deleting image from Cloudinary:", cloudinaryError);
                // Continue with deletion even if Cloudinary cleanup fails
            }
        }

        await Project.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Project deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete project. Please try again."
        });
    }
};

// Toggle Project Status (API)
exports.toggleProjectStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Toggle the status
        project.isActive = !project.isActive;
        await project.save();

        res.json({
            success: true,
            message: `Project ${project.isActive ? 'activated' : 'deactivated'} successfully!`,
            project
        });
    } catch (error) {
        console.error("Error toggling project status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle project status. Please try again."
        });
    }
};
