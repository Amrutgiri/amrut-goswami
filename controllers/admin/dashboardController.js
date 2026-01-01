const Project = require("../../models/Project");
const Skill = require("../../models/Skill");
const Message = require("../../models/Message");
const Experience = require("../../models/Experience");
const Education = require("../../models/Education");
const Service = require("../../models/Service");

exports.dashboardPage = async (req, res) => {
    try {
        // Fetch Counts
        const projectCount = await Project.countDocuments();
        const skillCount = await Skill.countDocuments();
        const messageCount = await Message.countDocuments();
        const experienceCount = await Experience.countDocuments();
        const educationCount = await Education.countDocuments();
        const serviceCount = await Service.countDocuments();

        // Fetch Recent Activity (Aggregate latest 5 from each and sort)
        // We will fetch limited fields to keep it light
        const recentProjects = await Project.find().sort({ updatedAt: -1 }).limit(5).select('title updatedAt isActive');
        const recentSkills = await Skill.find().sort({ updatedAt: -1 }).limit(5).select('name updatedAt isActive');
        const recentExperiences = await Experience.find().sort({ updatedAt: -1 }).limit(5).select('companyName updatedAt isActive');

        // Normalize data for the view
        const activityLog = [];

        recentProjects.forEach(item => {
            activityLog.push({
                type: 'Project',
                title: item.title,
                date: item.updatedAt,
                status: item.isActive,
                badgeClass: 'project'
            });
        });

        recentSkills.forEach(item => {
            activityLog.push({
                type: 'Skill',
                title: item.name,
                date: item.updatedAt,
                status: item.isActive,
                badgeClass: 'skill'
            });
        });

        recentExperiences.forEach(item => {
            activityLog.push({
                type: 'Experience',
                title: item.companyName,
                date: item.updatedAt,
                status: item.isActive,
                badgeClass: 'experience'
            });
        });

        // Sort combined list by date desc
        activityLog.sort((a, b) => b.date - a.date);

        // Take top 10 unique interactions
        const recentActivity = activityLog.slice(0, 10);

        res.render("admin/dashboard", {
            layout: "layouts/admin",
            title: "Dashboard",
            counts: {
                projects: projectCount,
                skills: skillCount,
                messages: messageCount,
                experience: experienceCount,
                education: educationCount,
                services: serviceCount
            },
            recentActivity
        });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Server Error");
    }
};
