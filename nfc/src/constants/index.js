export const CARD_TYPES = {
    STUDENT: 'student',
    FACULTY: 'faculty',
    STAFF: 'staff',
    EMPLOYEE: 'employee',
    VISITOR: 'visitor'
};

export const ORGANIZATION_TYPES = {
    UNIVERSITY: 'university',
    COMPANY: 'company'
};

export const VERIFICATION_METHODS = {
    CARD_ONLY: 'card_only',
    FINGERPRINT: 'fingerprint',
    CARD_AND_FINGERPRINT: 'card_and_fingerprint'
};

export const WEBSOCKET_EVENTS = {
    ACCESS_STATS: 'accessStats',
    ACCESS_LOGS: 'accessLogs',
    REGISTRATION_APPROVED: 'registrationApproved',
    REGISTRATION_REJECTED: 'registrationRejected'
};

export const API_ENDPOINTS = {
    ORGANIZATIONS: '/organizations',
    DEPARTMENTS: '/departments',
    CARDS: '/cards',
    ACCESS_LOGS: '/access-logs',
    ACCESS_STATS: '/access-stats',
    DEVICES: '/devices'
}; 