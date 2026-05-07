import jwt from 'jsonwebtoken';

/**
 * Centralized context injection middleware.
 *
 * Verifies JWT token from Authorization header or cookie.
 * Injects user_id, org_id, and role_name into the request object.
 */
export default (req, res, next) => {
    let token = req.cookies?.token;
    
    // Fallback to Bearer token
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user_id = decoded.user_id;
            req.org_id = decoded.org_id;
            req.role_name = decoded.role_name;
        } catch (error) {
            console.warn("Invalid JWT token provided:", error.message);
            const rawOrgId = req.headers['x-org-id'] || req.query.org_id || null;
            req.org_id = rawOrgId ? Number(rawOrgId) : null;
            req.user_id = null;
            req.role_name = null;
        }
    } else {
        // Fallback for missing token (can be removed once fully migrated to JWT)
        const rawOrgId = req.headers['x-org-id'] || req.query.org_id || null;
        req.org_id = rawOrgId ? Number(rawOrgId) : null;
        req.user_id = null;
        req.role_name = null;
    }

    next();
};
