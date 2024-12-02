export function formatDate(dateString, format = 'MMM D, YYYY h:mm A') {
    const date = new Date(dateString);
    
    const options = {
        year: format.includes('YYYY') ? 'numeric' : undefined,
        month: format.includes('MMM') ? 'short' : undefined,
        day: format.includes('D') ? 'numeric' : undefined,
        hour: format.includes('h') ? 'numeric' : undefined,
        minute: format.includes('mm') ? '2-digit' : undefined,
        hour12: format.includes('A')
    };

    return date.toLocaleString('en-US', options);
}

export function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

export function getDateRange(days = 7) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
} 