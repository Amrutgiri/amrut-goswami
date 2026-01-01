const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const authController = require("../controllers/admin/authController");
const aboutController = require("../controllers/admin/aboutController");
const skillController = require("../controllers/admin/skillController");
const projectController = require("../controllers/admin/projectController");
const experienceController = require("../controllers/admin/experienceController");
const educationController = require("../controllers/admin/educationController");
const messageController = require("../controllers/admin/messageController");
const serviceController = require("../controllers/admin/serviceController");
const dashboardController = require("../controllers/admin/dashboardController");






// Auth
router.get("/login", authController.loginPage);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Dashboard
router.get("/dashboard", auth, dashboardController.dashboardPage);


// About Section
router.get("/about", auth, aboutController.editPage);
router.post("/about", auth, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), aboutController.update);

// Skills Section
router.get("/skills", auth, skillController.skillsPage);

// Skills API Routes (AJAX)
router.get("/api/skills", auth, skillController.getSkillsAPI);
router.get("/api/skills/:id", auth, skillController.getSkillById);
router.post("/api/skills", auth, skillController.createSkillAPI);
router.put("/api/skills/:id", auth, skillController.updateSkillAPI);
router.patch("/api/skills/:id/toggle-status", auth, skillController.toggleSkillStatus);
router.delete("/api/skills/:id", auth, skillController.deleteSkillAPI);

// Projects Section
router.get("/projects", auth, projectController.projectsPage);

// Projects API Routes (AJAX)
router.get("/api/projects", auth, projectController.getProjectsAPI);
router.get("/api/projects/:id", auth, projectController.getProjectById);
router.post("/api/projects", auth, upload.single('projectImage'), projectController.createProjectAPI);
router.put("/api/projects/:id", auth, upload.single('projectImage'), projectController.updateProjectAPI);
router.patch("/api/projects/:id/toggle-status", auth, projectController.toggleProjectStatus);
router.delete("/api/projects/:id", auth, projectController.deleteProjectAPI);

// Experience Section
router.get("/experience", auth, experienceController.experiencePage);

// Experience API Routes (AJAX)
router.get("/api/experiences", auth, experienceController.getExperiencesAPI);
router.get("/api/experiences/:id", auth, experienceController.getExperienceById);
router.post("/api/experiences", auth, experienceController.createExperienceAPI);
router.put("/api/experiences/:id", auth, experienceController.updateExperienceAPI);
router.patch("/api/experiences/:id/toggle-status", auth, experienceController.toggleExperienceStatus);
router.delete("/api/experiences/:id", auth, experienceController.deleteExperienceAPI);



// Education Section
router.get("/education", auth, educationController.educationPage);

// Education API Routes (AJAX)
router.get("/api/education", auth, educationController.getEducationAPI);
router.get("/api/education/:id", auth, educationController.getEducationById);
router.post("/api/education", auth, educationController.createEducationAPI);
router.put("/api/education/:id", auth, educationController.updateEducationAPI);
router.patch("/api/education/:id/toggle-status", auth, educationController.toggleEducationStatus);
router.delete("/api/education/:id", auth, educationController.deleteEducationAPI);


// Messages Section
router.get("/messages", auth, messageController.messagesPage);

// Messages API Routes (AJAX)
router.get("/api/messages", auth, messageController.getMessagesAPI);
router.get("/api/messages/:id", auth, messageController.getMessageById);
router.delete("/api/messages/:id", auth, messageController.deleteMessageAPI);
// Public route for contact form (normally would be in a publicRoutes file, but keeping here for admin availability or testing)
router.post("/api/messages", auth, messageController.createMessageAPI);


// Services Section
router.get("/services", auth, serviceController.servicesPage);

// Services API Routes
router.get("/api/services", auth, serviceController.getServicesAPI);
router.get("/api/services/:id", auth, serviceController.getServiceById);
router.post("/api/services", auth, serviceController.createServiceAPI);
router.put("/api/services/:id", auth, serviceController.updateServiceAPI);
router.delete("/api/services/:id", auth, serviceController.deleteServiceAPI);
router.patch("/api/services/:id/toggle-status", auth, serviceController.toggleServiceStatus);

module.exports = router;
