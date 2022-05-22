const jwt = require("jsonwebtoken");
const { newEnforcer } = require('casbin');
const AppError = require("../utils/error");



function accessControl() {
    const enforcer = newEnforcer('casbin-policy/auth_model.conf', 'casbin-policy/auth_policy.csv');
    
    return async function(req, res, next) {
        const token = req.cookies["token"];
        let isAuth = false;

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload;
            isAuth = true;
        }
        catch(err) {
            req.user = { role: "anonymous" };
        }

        // policy object
        let path = req.path;
        if (path[path.length - 1] == "/" && path.length > 1) {
            path = path.slice(0, path.length - 1);
        }

        const ok = await (await enforcer).enforce(req.user.role, path, req.method);
        if (ok) {
            return next();
        }
        
        if (isAuth) {
            return next(new AppError(403, "Forbidden"));
        } 
        else {
            return next(new AppError(401, "Unauthorized"));
        }
    }
}

module.exports = accessControl;