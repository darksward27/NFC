const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchWithAuth(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            // Add any auth headers here if needed
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

export const organizationsApi = {
    getAll: () => fetchWithAuth('/organizations'),
    getById: (id) => fetchWithAuth(`/organizations/${id}`),
    create: (data) => fetchWithAuth('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchWithAuth(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchWithAuth(`/organizations/${id}`, {
        method: 'DELETE',
    }),
};

export const departmentsApi = {
    getAll: (orgId) => fetchWithAuth(`/departments?organizationId=${orgId}`),
    getById: (id) => fetchWithAuth(`/departments/${id}`),
    create: (data) => fetchWithAuth('/departments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchWithAuth(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchWithAuth(`/departments/${id}`, {
        method: 'DELETE',
    }),
};

export const cardsApi = {
    getAll: (deptId) => fetchWithAuth(`/cards?departmentId=${deptId}`),
    getById: (id) => fetchWithAuth(`/cards/${id}`),
    create: (data) => fetchWithAuth('/cards', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchWithAuth(`/cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchWithAuth(`/cards/${id}`, {
        method: 'DELETE',
    }),
};

export const accessLogsApi = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return fetchWithAuth(`/access-logs?${queryString}`);
    },
    getStats: () => fetchWithAuth('/access-stats'),
};

export const devicesApi = {
    getAll: () => fetchWithAuth('/devices'),
    getById: (id) => fetchWithAuth(`/devices/${id}`),
    enableRegistration: (deviceId) => fetchWithAuth(`/devices/${deviceId}/registration-mode`, {
        method: 'POST',
        body: JSON.stringify({ enabled: true }),
    }),
    disableRegistration: (deviceId) => fetchWithAuth(`/devices/${deviceId}/registration-mode`, {
        method: 'POST',
        body: JSON.stringify({ enabled: false }),
    }),
}; 