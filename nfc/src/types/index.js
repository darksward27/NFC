/**
 * @typedef {Object} Organization
 * @property {string} _id
 * @property {string} name
 * @property {('university'|'company')} type
 * @property {string} address
 * @property {string} contactEmail
 * @property {string} contactPhone
 * @property {boolean} active
 */

/**
 * @typedef {Object} Department
 * @property {string} _id
 * @property {string} organizationId
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {boolean} active
 */

/**
 * @typedef {Object} Card
 * @property {string} _id
 * @property {string} id
 * @property {string} organizationId
 * @property {string} departmentId
 * @property {string} holderName
 * @property {('student'|'faculty'|'staff'|'employee'|'visitor')} type
 * @property {string} email
 * @property {string} phone
 * @property {string} validFrom
 * @property {string} validUntil
 * @property {boolean} active
 */

/**
 * @typedef {Object} AccessLog
 * @property {string} _id
 * @property {string} timestamp
 * @property {string} holderName
 * @property {string} department
 * @property {boolean} authorized
 * @property {string} location
 * @property {string} verificationMethod
 */

/**
 * @typedef {Object} Device
 * @property {string} _id
 * @property {string} deviceId
 * @property {string} name
 * @property {string} location
 * @property {boolean} active
 * @property {boolean} registrationMode
 */ 