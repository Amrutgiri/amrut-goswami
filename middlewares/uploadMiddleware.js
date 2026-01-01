const multer = require("multer");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "portfolio",
        allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    },
});

module.exports = multer({ storage });
