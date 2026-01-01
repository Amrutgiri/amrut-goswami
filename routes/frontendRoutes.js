const express = require("express");
const router = express.Router();

const frontendController = require("../controllers/frontendController");
router.get("/", frontendController.home);
router.post("/send-message", frontendController.sendMessage);

module.exports = router;
