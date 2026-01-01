const Message = require("../../models/Message");

// ========================================
// PAGE RENDERING
// ========================================

// Display Messages Inbox Page
exports.messagesPage = async (req, res) => {
    try {
        res.render("admin/messages", {
            layout: "layouts/admin",
            title: "Messages Inbox"
        });
    } catch (error) {
        console.error("Error loading messages page:", error);
        res.status(500).send("Server Error");
    }
};

// ========================================
// API ENDPOINTS (JSON Responses)
// ========================================

// Get All Messages (for DataTables)
exports.getMessagesAPI = async (req, res) => {
    try {
        // Sort by created date (newest first)
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages"
        });
    }
};

// Get Single Message by ID (and mark as read)
exports.getMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and simultaneously update isRead to true
        const message = await Message.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.json({
            success: true,
            message
        });
    } catch (error) {
        console.error("Error fetching message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load message details"
        });
    }
};

// Delete Message
exports.deleteMessageAPI = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMessage = await Message.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.json({
            success: true,
            message: "Message deleted successfully!"
        });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete message"
        });
    }
};

// Create Message (Public API - for testing/frontend contact form)
exports.createMessageAPI = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message content are required"
            });
        }

        const newMessage = await Message.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject ? subject.trim() : "No Subject",
            message: message.trim()
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: newMessage
        });
    } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
};
