"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRoles = parseRoles;
exports.hasRole = hasRole;
exports.hasAnyRole = hasAnyRole;
function parseRoles(roleString) {
    return roleString.split(',').filter(Boolean);
}
function hasRole(roleString, role) {
    return parseRoles(roleString).includes(role);
}
function hasAnyRole(roleString, roles) {
    const parsed = parseRoles(roleString);
    return roles.some((r) => parsed.includes(r));
}
