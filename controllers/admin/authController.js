const Admin = require("../../models/Admin");

exports.loginPage = (req, res) => {
    res.render("admin/login", {
        layout: false,
        error: null
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.render("admin/login", {
            layout: false,
            error: "Invalid email or password"
        });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        return res.render("admin/login", {
            layout: false,
            error: "Invalid email or password"
        });
    }

    req.session.admin = {
        id: admin._id,
        email: admin.email
    };

    res.redirect("/admin/dashboard");
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
};
