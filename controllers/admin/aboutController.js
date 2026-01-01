const About = require("../../models/About");

// Display About Section Form
exports.editPage = async (req, res) => {
    try {
        const about = await About.findOne();
        res.render("admin/about", {
            layout: "layouts/admin",
            title: "About Section",
            about
        });
    } catch (error) {
        console.error("Error loading about page:", error);
        res.status(500).send("Server Error");
    }
};

// Update About Section
exports.update = async (req, res) => {
    try {
        console.log("=== ABOUT FORM SUBMISSION ===");
        console.log("Body:", req.body);
        console.log("Files:", req.files);

        const { fullName, professionalTitle, shortBio, facebook, instagram, linkedin, youtube } = req.body;

        // Validation
        if (!fullName || !professionalTitle || !shortBio) {
            req.flash('error', 'All fields are required');
            return res.redirect('/admin/about');
        }

        // Find existing or create new
        let about = await About.findOne();
        console.log("Existing about:", about);

        const updateData = {
            fullName,
            professionalTitle,
            shortBio,
            socialLinks: {
                facebook,
                instagram,
                linkedin,
                youtube
            }
        };

        // Handle profile image upload
        if (req.files && req.files['profileImage'] && req.files['profileImage'].length > 0) {
            const file = req.files['profileImage'][0];
            console.log("Profile image uploaded:", file);

            // Validate file size (5MB)
            if (file.bytes > 5 * 1024 * 1024) {
                req.flash('error', 'Profile image size should not exceed 5MB');
                return res.redirect('/admin/about');
            }

            updateData.profileImage = {
                public_id: file.public_id,
                url: file.secure_url
            };
        } else if (about && about.profileImage) {
            // Keep existing image if no new one uploaded
            updateData.profileImage = about.profileImage;
        }

        // Handle resume upload
        if (req.files && req.files['resume'] && req.files['resume'].length > 0) {
            const file = req.files['resume'][0];
            console.log("Resume uploaded:", file);

            // Validate file size (10MB)
            if (file.bytes > 10 * 1024 * 1024) {
                req.flash('error', 'Resume size should not exceed 10MB');
                return res.redirect('/admin/about');
            }

            updateData.resume = {
                public_id: file.public_id,
                url: file.secure_url
            };
        } else if (about && about.resume) {
            // Keep existing resume if no new one uploaded
            updateData.resume = about.resume;
        }

        console.log("Update data:", updateData);

        if (about) {
            // Update existing
            console.log("Updating existing about document...");
            const updated = await About.findByIdAndUpdate(about._id, updateData, { new: true });
            console.log("Updated document:", updated);
        } else {
            // Create new
            console.log("Creating new about document...");
            const created = await About.create(updateData);
            console.log("Created document:", created);
        }

        console.log("=== SUCCESS - Redirecting ===");
        req.flash('success', 'Profile updated successfully!');
        res.redirect("/admin/about");
    } catch (error) {
        console.error("=== ERROR updating about ===");
        console.error(error);
        req.flash('error', 'Failed to update profile. Please try again.');
        res.redirect("/admin/about");
    }
};
