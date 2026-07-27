const userModel = require("../models/user");

async function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/");
    }
    try {
        const user = await userModel.findById(req.session.userId);
        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/login");
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        return res.redirect("/login");
    }
}

module.exports = isLoggedIn;