const Service = require("../../models/Service");

// ========================================
// PAGE RENDERING
// ========================================

// Display Services Management Page
exports.servicesPage = async (req, res) => {
    try {
        res.render("admin/services", {
            layout: "layouts/admin",
            title: "Services Management"
        });
    } catch (error) {
        console.error("Error loading services page:", error);
        res.status(500).send("Server Error");
    }
};

// ========================================
// API ENDPOINTS (JSON Responses)
// ========================================

// Get All Services
exports.getServicesAPI = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ success: false, message: "Failed to fetch services" });
    }
};

// Get Single Service
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.json({ success: true, service });
    } catch (error) {
        console.error("Error fetching service:", error);
        res.status(500).json({ success: false, message: "Failed to load service details" });
    }
};

// Create Service
exports.createServiceAPI = async (req, res) => {
    try {
        const { title, icon, shortDescription, detailDescription, isActive } = req.body;

        if (!title || !icon) {
            return res.status(400).json({ success: false, message: "Title and Icon are required" });
        }

        const newService = await Service.create({
            title,
            icon,
            shortDescription,
            detailDescription,
            isActive: isActive === 'on' || isActive === true
        });

        res.status(201).json({ success: true, message: "Service created successfully", service: newService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ success: false, message: "Failed to create service" });
    }
};

// Update Service
exports.updateServiceAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, icon, shortDescription, detailDescription, isActive } = req.body;

        const updatedService = await Service.findByIdAndUpdate(
            id,
            {
                title,
                icon,
                shortDescription,
                detailDescription,
                isActive: isActive === 'on' || isActive === true
            },
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.json({ success: true, message: "Service updated successfully", service: updatedService });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ success: false, message: "Failed to update service" });
    }
};

// Delete Service
exports.deleteServiceAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).json({ success: false, message: "Failed to delete service" });
    }
};

// Toggle Service Status
exports.toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        service.isActive = !service.isActive;
        await service.save();

        res.json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
            data: service
        });
    } catch (error) {
        console.error("Error toggling status:", error);
        res.status(500).json({ success: false, message: "Failed to toggle status" });
    }
};
