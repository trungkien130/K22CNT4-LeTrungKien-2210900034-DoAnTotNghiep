import type { User } from "../types";

export const ADMIN_PERMISSIONS = [
    "USER_VIEW",
    "USER_MANAGE",
    "CLASS_MANAGE",
    "CLASS_VIEW_LIST",
    "SEM_MANAGE",
    "DEPT_MANAGE",
    "QUESTION_MANAGE",
    "ANSWER_MANAGE",
    "PERMISSION_MANAGE",
    "SYSTEM_ADMIN",
];

export const hasAdminAccess = (user: User | null): boolean => {
    if (!user) return false;
    if (user.role === "ADMIN" || user.role === "SUPPER_ADMIN") return true; // Legacy/Super check available

    // Check if user has ANY admin permission
    if (user.permissions && user.permissions.some(p => ADMIN_PERMISSIONS.includes(p))) {
        return true;
    }

    return false;
};

export const hasPermission = (user: User | null, code: string): boolean => {
    if (!user) return false;
    if (user.role === "SUPPER_ADMIN") return true;
    return user.permissions?.includes(code) || false;
};
