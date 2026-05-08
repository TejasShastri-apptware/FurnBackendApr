import jwt from 'jsonwebtoken';

/**
 * Centralized context injection middleware.
 *
 * If a token is present: verify it strictly. A tampered or expired
 * token is REJECTED with 401 — it never silently degrades to guest.
 *
 * If no token is present: treat as a guest. Allow org_id from the
 * x-org-id header so public routes (product browsing, etc.) work
 * for unauthenticated users. user_id and role_name stay null.
 */
export default (req, res, next) => {
    let token = req.cookies?.token;

    // Fallback to Bearer token in Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        // A token was provided — verify it strictly.
        // An invalid/expired token is NOT allowed to silently fall through as a guest.
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user_id = decoded.user_id;
            req.org_id = decoded.org_id;
            req.role_name = decoded.role_name;
        } catch (error) {
            // Token is present but invalid — reject immediately.
            return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
        }
    } else {
        // No token — guest request. Trust x-org-id only for org scoping on public routes.
        const rawOrgId = req.headers['x-org-id'] || req.query.org_id || null;
        req.org_id = rawOrgId ? Number(rawOrgId) : null;
        req.user_id = null;
        req.role_name = null;
    }

    next();
};
