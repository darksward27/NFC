export class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

export function handleError(error) {
    if (error instanceof APIError) {
        console.error(`API Error (${error.status}):`, error.message);
        // You can add toast notifications here
    } else {
        console.error('Application Error:', error);
    }
} 