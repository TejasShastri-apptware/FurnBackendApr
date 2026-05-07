export const requireAuth = (req, res, next) => {
    if (!req.user_id) {
        return res.status(401).json({ message: "Authentication required" });
    }
    next();
};

export const requireAdmin = (req, res, next) => {
    if (!req.user_id) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const adminRoles = ['Admin', 'Org_level_access', 'Dev'];
    if (!adminRoles.includes(req.role_name)) {
        return res.status(403).json({ message: "Admin privileges required" });
    }
    next();
};