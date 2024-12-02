export const validators = {
    required: (value) => {
        if (value === undefined || value === null || value === '') {
            return 'This field is required';
        }
        return null;
    },

    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Invalid email address';
        }
        return null;
    },

    phone: (value) => {
        if (!value) return null;
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(value)) {
            return 'Invalid phone number';
        }
        return null;
    },

    cardId: (value) => {
        if (!value) return null;
        const cardIdRegex = /^[A-Fa-f0-9]{8,}$/;
        if (!cardIdRegex.test(value)) {
            return 'Invalid card ID format';
        }
        return null;
    }
};

export function validateForm(data, validationRules) {
    const errors = {};
    Object.keys(validationRules).forEach(field => {
        const fieldValidators = validationRules[field];
        fieldValidators.forEach(validator => {
            const error = validator(data[field]);
            if (error) {
                errors[field] = error;
            }
        });
    });
    return errors;
} 