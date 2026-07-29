const adminModel = require("../models/adminModel");

async function adminLoggedIn(req, res, next) {
    if (!req.session.adminId) {
        return res.redirect("/admin/login");
    }
    try {
        const admin = await adminModel.findById(req.session.adminId);
        if (!admin) {
            req.session.destroy(() => {});
            return res.redirect("/admin/login");
        }
        req.admin = admin;
        next();
    } catch (err) {
        return res.redirect("/admin/login");
    }
}

module.exports = adminLoggedIn;